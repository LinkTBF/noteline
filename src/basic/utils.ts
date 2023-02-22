import Chance from 'chance'

export function basename(filepath: string): string {
  const temp = filepath.split('/')
  return temp[temp.length - 1]
}

export const chance = new Chance()