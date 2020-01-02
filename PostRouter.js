const responses = [];

const eventHandler = (key, event, data, res) => {
  const index = responses.findIndex( resp => resp.key !== key);
  if (~index) {
    const response = responses[index];
    response.res.write(JSON.stringify({
      key,
      event,
      data
    }));
    res.write(JSON.stringify({status: 'OK'}));
    responses.splice(index, 1);
    response.res.end();
    res.end();
  }
};

const postRouter = async (url, req, res) => {
  const body = await new Promise((resolve => {
    let body = [];
    req.on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = JSON.parse(Buffer.concat(body).toString());
      resolve(body);
    });
  }));

  switch (url) {
    case '/send':
      {
        const {key, event, data} = body;
        eventHandler(key, body, data, res);
      }
      break;
    case '/subscribe':
      {
        const unique = [...Array(10)].map(i=>(~~(Math.random()*36)).toString(36)).join('');
        responses.push({
          id: unique,
          key: body.key,
          res: res
        });
        setTimeout(() => {
          const index = responses.findIndex( resp => resp.id === unique );
          if (~index) {
            responses[index].res.write(JSON.stringify({result: null}));
            responses[index].res.end();
            responses.splice(index, 1);
          }
          console.table(responses);
        }, 10000);
      }
      break;
  }
};

module.exports = postRouter;
