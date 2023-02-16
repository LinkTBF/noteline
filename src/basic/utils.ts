import Chance from 'chance'
import _ from 'lodash'

export function template(source: string, data: Record<string, string>): string {
  return (_.template(source))(data)
}

export function basename(filepath: string): string {
  return filepath
}

export const chance = new Chance()