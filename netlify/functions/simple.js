exports.handler = async function(event, context) {
  console.log('Function called:', event.path);
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: "Simple function works!",
      timestamp: new Date().toISOString(),
      path: event.path,
      method: event.httpMethod,
      query: event.queryStringParameters
    })
  };
}; 