export default function (parts, ...values) {
  return parts.reduce((acc, part, i) => {
    let value = values[i - 1]
    if (value == null) value = "NULL or UNDEFINED"
    if (i == 0) value = ""
    return acc + value + part
  }, "")
}
