const svgFiles = import.meta.glob('../assets/**/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
})

export const findSvg = (keyword) => {
  const path = Object.keys(svgFiles).find((key) =>
    key.toLowerCase().includes(keyword),
  )
  return path ? svgFiles[path] : ''
}
