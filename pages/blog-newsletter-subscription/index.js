const form = document.querySelector("#newsletterForm");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.querySelector("#name").value;
  const email = document.querySelector("#email").value;

  const subscriber = {
    name: name,
    email: email,
  };

  fetch("<REPLACE-WITH-DOMAIN-HERE>/api/blog/newsletter/subscriber", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(subscriber),
  })
    .then((response) => {
      if (response.ok) {
        alert("Subscription successful!");
        form.reset();
      } else {
        throw new Error("Error in subscription");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error in subscription. Please try again later.");
    });
});
