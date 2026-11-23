import { useState } from 'react'

/** State input form: mengembalikan [value, onChange, setValue]. */
export default function useInput(initial = '') {
  const [value, setValue] = useState(initial)
  const onChange = (event) => setValue(event.target.value)
  return [value, onChange, setValue]
}
