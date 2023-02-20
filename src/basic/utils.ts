import Chance from 'chance'
import _ from 'lodash'

export function template(source: string, data: Record<string, string>): string {
  return (_.template(source))(data)
}

export function basename(filepath: string): string {
  const temp = filepath.split('/')
  return temp[temp.length - 1]
}

export const chance = new Chance()