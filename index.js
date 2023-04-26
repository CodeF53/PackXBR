import scale from './scale.js';

async function handleSubmit(event) {
  event.preventDefault();

  // get input values
  const file = event.target.querySelector("#pack").files[0];
  const scaleFactor = parseInt(event.target.querySelector("#scaleFactor").value);
  const isAuto = event.target.querySelector("#autoScale").checked;

  // Load the zip file with zip.js
  const zip = new JSZip();
  const zipFile = await zip.loadAsync(file);

  // Get all the png files in the zip
  const images = Object.values(zipFile.files).filter(file => file.name.endsWith('.png'));

  // Scale each png file
  let scaledImages;
  if (isAuto) {
    scaledImages = await Promise.all(images.map(async img => {
      // TODO: decide what settings to use based on image location
      const scaledData = await scale(img, scaleFactor);
      return { name: img.name, data: scaledData };
    }));
  } else {
    // TODO: implement manual scaler
  }

  // add them to a new zip file
  const newZip = new JSZip();
  scaledImages.forEach(({ name, data }) => {
    newZip.file(name, data, { base64: true });
  });

  // Generate the zip file as a blob
  const zipBlob = await newZip.generateAsync({ type: 'blob' });

  // Save the zip file as the (input_filename)_xbr_(scaleFactor)x.zip
  const downloadLink = document.createElement('a');
  downloadLink.href = window.URL.createObjectURL(zipBlob);
  downloadLink.download = file.name.split(".").slice(0,-1).join(".")+`_xbr_${scaleFactor}x.zip`
  downloadLink.click();
}
const packInput = document.getElementById("packInput");
packInput.addEventListener("submit", handleSubmit);