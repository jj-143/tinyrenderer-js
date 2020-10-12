import TGALoader from "tga-js"

export function loadTGA(src) {
  return new Promise(resolve => {
    const tgaLoader = new TGALoader()
    tgaLoader.open(src, () => {
      resolve({
        imageData: tgaLoader.getImageData().data,
        header: tgaLoader.header,
      })
    })
  })
}
