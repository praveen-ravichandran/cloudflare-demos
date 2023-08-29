/**
 * Learn more at https://developers.cloudflare.com/workers/
 */

/**
 * NanoID code picked from the library
 * Repo: https://github.com/ai/nanoid
 * Code Extracted from: https://cdn.jsdelivr.net/npm/nanoid/nanoid.js
 */
export let nanoid=(t=21)=>crypto.getRandomValues(new Uint8Array(t)).reduce(((t,e)=>t+=(e&=63)<36?e.toString(36):e<62?(e-26).toString(36).toUpperCase():e>62?"-":"_"),"");

async function createRedirectEntry(KV_STORE, urlToRedirect) {
  if(!urlToRedirect) {
    return {
      error: 'Missing Query Parameter: urlToRedirect',
      errorCode: 400
    };
  }
  const uniqueKey = nanoid(8);
  await KV_STORE.put(uniqueKey, decodeURIComponent(urlToRedirect));
  return {
    shortUrl: uniqueKey
  };
}

async function fetchRedirectEntry(KV_STORE, urlPath) {
  const urlKey = urlPath.substring(1);
  if(!urlKey) {
    return {
      error: 'Not Found',
      errorCode: 404
    };
  }
  const redirectTo = await KV_STORE.get(urlKey);
  if(!redirectTo) {
    return {
      error: 'Not Found',
      errorCode: 404
    }
  }
  return {
    redirectTo,
    statusCode: 302
  };
}

function buildResponse(responseData) {
  if(responseData.error) {
    return new Response(JSON.stringify(responseData), {
      status: responseData.errorCode 
    });
  }
  if(responseData.redirectTo) {
    return new Response('', {
      status: responseData.statusCode,
      headers: {
        'location': responseData.redirectTo,
        'cache-control': 'max-age=86400'
      }
    });
  }
  if(responseData.shortUrl) {
    return new Response(JSON.stringify(responseData), {
      status: 200,
    });
  }
  return new Response('Internal Server Error', {
    status: 500
  });
}

export default {
  async fetch(request, env, ctx) {
    const { pathname, searchParams } = new URL(request.url);
    const { REDIRECTOR_STORE } = env;
    let responseData = {};
    
    if (pathname.startsWith('/api/')) {
      switch(pathname) {
        case '/api/create':
          const urlToRedirect = searchParams.get('urlToRedirect')
          responseData = await createRedirectEntry(REDIRECTOR_STORE, urlToRedirect);
          break;
        default:
          responseData = {
            error: 'Not Found',
            errorCode: 404
          }
      }
    } else {
      responseData = await fetchRedirectEntry(REDIRECTOR_STORE, pathname);
    }
    
    return buildResponse(responseData);
  },
};
