const xpress = require('express');

const app = xpress();

app.get(('/'), (req, res) => {
    res.write('hello');
    res.end();
})

app.listen(3000, () => {
    console.log('App listening on port 3000!');
});