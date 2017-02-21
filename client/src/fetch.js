export function fetchCheck(res) {
  if (res.ok) {
    return res;
  } else {
    return res.text()
      .then(text => {
        throw new Error(text ? text : res.statusText);
      }, err => {
        throw new Error(res.statusText);
      })
      .catch(err => {
        console.error("Error in fetchCheck: %o", err);
        throw err;
      });
  }
}

export function fetchJSON(res) {
  return Promise.resolve(res)
    .then(fetchCheck)
    .then(res => res.json());
}
