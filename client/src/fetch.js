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

export function fetchJSON(arg) {
  if (typeof(arg) === "object" && arg.constructor.name === "Response") {
    //console.log("fetchJSON: " + arg.url);
    return Promise.resolve(arg)
      .then(fetchCheck)
      .then(res => res.json());
  } else if (typeof(arg) === "string") {
    return fetch(arg, {
      method: 'get',
      headers: { 'Authorization': sessionStorage.token }
    }).then(fetchJSON);
  }
}
