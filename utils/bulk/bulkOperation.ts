export default async function bulkOperation(array: any[], WorkerConstructor: new () => Worker, numThreads: number, iterProgress: () => void, ...args: any[]) {
  // create workers
  const workers = Array.from({ length: numThreads }, () => new WorkerConstructor())

  // assign onmessage to give them work to do until we are done
  const targetLen = array.length
  const outData: unknown[] = []

  return new Promise((resolve, _reject) => {
    workers.forEach(worker => worker.onmessage = (event: { data: { data?: unknown } }) => {
      // if we got data, save it & push to target array
      if (event.data.data) {
        iterProgress()
        outData.push(event.data.data)
      }

      // get next item to work on
      const input = array.pop()

      if (input) { // if there is an item to work on, do it
        worker.postMessage({ input, args })
      }
      else {
        // if no more jobs to assign, we don't need this worker anymore
        worker.terminate()

        // if we have completed all work, resolve promise
        if (outData.length === targetLen)
          resolve(outData)
      }
    })
  })
}
