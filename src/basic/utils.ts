export function basename(filepath: string): string {
  const temp = filepath.split('/')
  return temp[temp.length - 1]
}