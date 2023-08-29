/**
 * Learn more at https://developers.cloudflare.com/workers/
 */
 
const responseInit = {
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*'
  }
}

export default {
  async fetch(request, env, ctx) {
    const { pathname, searchParams } = new URL(request.url);
    const { BLOG_DB } = env; // Create D1 Database binding in the Worker's Settings section before running the code

    if (pathname.startsWith('/api/blog/newsletter/subscriber')){
      switch (request.method) {
        case 'GET':
          const subscriberList = await BLOG_DB.prepare(
            "SELECT * FROM newsletter_subscriber"
          )
            .all();
          return Response.json(subscriberList.results, responseInit);
        case 'POST':
          try {
            const newsletterRequest = await request.json();
            if(!newsletterRequest.name || !newsletterRequest.email) {
              return Response.json({error: "'name' and 'email' body params are mandatory"}, {status: 400});
            }
            const uniqueUuid = crypto.randomUUID();
            const newsletterSubscriberSave = await BLOG_DB.prepare(
              "INSERT INTO newsletter_subscriber (id, name, email) VALUES (?1, ?2, ?3)"
            )
              .bind(uniqueUuid, newsletterRequest.name, newsletterRequest.email)
              .run();
            return Response.json(newsletterSubscriberSave, responseInit);
          } catch(e) {
            return Response.json("Error Subscribing to Newsletter. Try again later.");
          }
        case 'DELETE':
          const subscriberId = searchParams.get('id');
          if(!subscriberId) {
            return Response.json({error: "'id' query param missing"}, {status: 400});
          }
          const newsletterSubscriberDelete = await BLOG_DB.prepare(
            "DELETE FROM newsletter_subscriber WHERE id = ?"
          )
            .bind(subscriberId)
            .run();
          return Response.json(newsletterSubscriberDelete, responseInit);
      }
    }

    return new Response("Hi", responseInit);

  },
};
