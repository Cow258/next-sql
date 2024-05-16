type UsersType = {
  id: number
  name: string
  pwd: string
}

type PostsType = {
  id: number
  user: number
  title: string
  content: string
}

type TableTypes = {
  users: UsersType
  posts: PostsType
}

// A helper type to pick keys from a type that are also in a given array of keys
type PickKeys<T, K extends keyof any> = K extends keyof T ? K : never

// A helper type to create a type with only the picked keys
type PickByArray<T, K extends ReadonlyArray<keyof any>> = Pick<
  T,
  PickKeys<T, K[number]>
>

class Query<T, SelectedKeys extends ReadonlyArray<keyof T> = []> {
  // The table method specifies the table to query and maps it to a type in TableTypes
  table<K extends keyof TableTypes>(
    this: Query<{}, []>,
    table: K
  ): Query<TableTypes[K]> {
    // Implementation goes here
    return this as unknown as Query<TableTypes[K]>
  }

  // The select method picks certain keys from the type
  select<K extends keyof T>(
    this: Query<T>,
    keys: K[]
  ): Query<PickByArray<T, typeof keys>> {
    // Implementation goes here
    return this as unknown as Query<PickByArray<T, typeof keys>>
  }

  // The toOne method joins another table and maps to a type, selecting certain keys from that type
  toOne<
    K extends keyof TableTypes,
    F extends keyof TableTypes[K],
    SK extends ReadonlyArray<keyof TableTypes[K]>
  >(
    this: Query<T>,
    foreignKey: `${F}:${K}.${string}`,
    options: {
      query: (q: Query<TableTypes[K]>) => Query<PickByArray<TableTypes[K], SK>>
    }
  ): Query<T & { [P in K]: PickByArray<TableTypes[K], SK> }> {
    // Implementation goes here
    return this as unknown as Query<
      T & { [P in K]: PickByArray<TableTypes[K], SK> }
    >
  }

  // The read method would execute the query and return the data
  async read(): Promise<T> {
    // Implementation goes here
    return {} as T
  }
}

// A function that creates a new Query instance
function xsql<T = {}>(): Query<T> {
  return new Query<T>()
}

const fetchUserAndPosts = async () => {
  const users = await xsql()
    .table('users') // should map "users" to `TableTypes.users`
    .select(['id', 'name']) // should Pick "id" and "name" from `UsersType`
    .toOne('id:posts.user', {
      // should map "posts" to `TableTypes.posts` and pick "id" and "title" from PostsType and join into to users
      query: (q) => q.select(['id', 'title']), // the `q` should be `xsql` instance
    })
    .read()
  users.id // should be number from `UsersType.id
  users.name // should be number from `UsersType.name
  users.posts // should be PostsType
  users.posts.id // should be number from `PostsType.id
  users.posts.title // should be string from `PostsType.title
}
