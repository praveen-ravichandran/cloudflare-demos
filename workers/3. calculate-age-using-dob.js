/**
 * Learn more at https://developers.cloudflare.com/workers/
 */

function calculateAge(dob) {
  return new Date().getFullYear() - new Date(dob).getFullYear();
}

export default {
  async fetch(request, env, ctx) {
    const personDetails = await request.json();
    return new Response(`Hello ${personDetails.name}! You are ${calculateAge(personDetails.dob)} years old.`,{
      headers: {
        'access-control-allow-origin': '*'
      }
    });
  },
};
