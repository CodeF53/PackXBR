// Distributes contents of input array into arrays of size N
// Large files tend to be in the same folder, so we use Round Robin distribution in an attempt to give each thread an equal amount of work
// Round robin item distribution results is ~1.6x faster
function chunkArray(array: Array<any>, size: number): Array<Array<any>> {
  const chunks: Array<Array<any>> = Array.from({ length: size }, () => [])

  for (let i = 0; i < array.length; i++)
    chunks[i % size].push(array[i])

  return chunks
}

// Create a utility function to create a web worker and return a promise
function createWorkerPromise(array: Array<any>, WorkerConstructor: new () => Worker, iterProgress: () => void, args: any[]): Promise<any> {
  return new Promise((resolve, reject) => {
    const worker = new WorkerConstructor()
    worker.postMessage({ array, args })

    worker.onmessage = (event) => {
      if (event.data.type === 'done') {
        resolve(event.data.data)
        worker.terminate()
      }
      else { iterProgress() }
    }

    worker.onerror = (error) => {
      reject(error)
      worker.terminate()
    }
  })
}

export default async function bulkOperation(array: any[], WorkerConstructor: new () => Worker, numThreads: number, iterProgress: () => void, ...args: any[]) {
  // Split array into numThreads chunks
  const arrayChunks = chunkArray(array, numThreads)

  // Create promises for each worker operation
  const workerPromises = arrayChunks.map(chunk => createWorkerPromise(chunk, WorkerConstructor, iterProgress, args))

  // Await results of worker promises
  const results = await Promise.all(workerPromises)

  // Combine worker results
  const combinedResults = results.reduce((acc, result) => acc.concat(result), [])

  return combinedResults
}
