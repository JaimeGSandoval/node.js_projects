// This is what a fetch from the frontend would look like when logging in. In order to satisfy cors, you must include - credentials: 'include' - in the fetch options object. It has fetch send the cookie. If not, cors will block the request if you don't have it set before you reach the cors check. HTTP does a pre-flight options check request to check options
// On the server side, you must set - Access-Control-Allow-Credentials: true -
// when sending the cookie back

const sendLogin = async () => {
   const user = document.getElementById('user').value;
   const pwd = document.getElementById('pwd').value;

   try {
     const response = await fetch('http://localhost:8000/auth', {
       method: 'POST'
       Content-Type: 'application/json',
       credentials: 'include',
       body: JSON.stringify({user, pwd});
      });

      if (!response.ok) {
          if(response.status === 401) {
            return await sendRefreshToken();
          }

          throw new Error(`${response.status} ${response.statusMessage}`)
      }

      return await response.json();

   } catch (err) {
     console.error(err);
   }


}
