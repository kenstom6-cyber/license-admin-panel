
function createKey(){
 fetch('/admin/key/create',{method:'POST'})
 .then(r=>r.json())
 .then(d=>alert('New key: '+d.key));
}
