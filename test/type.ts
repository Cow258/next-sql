import xsql from '../lib/index'

type User = {
  id: string
  name: string
}

export default async function main() {
  const rows = await xsql().read<User>('table')
  rows.map((row) => row.id)
  return rows
}
