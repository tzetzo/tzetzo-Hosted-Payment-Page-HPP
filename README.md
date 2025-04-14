## Getting Started

First, install the dependencies:

```bash
npm install
```

Second, run the development server:

```bash
npm run dev
```

Third, run the tests:

```bash
npm run test
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Expiry Handling

With the current backend API implementation, the `expiryDate` remains consistent when fetching data from `/${uuid}/summary` on both the `<DOMAIN>/payin/<UUID>` and `<DOMAIN>/payin/<UUID>/pay` pages.

Because of this, the `expiryDate` from the initial `/${uuid}/summary` request is used to start the countdown when the expiry page is first shown. This logic is handled inside the `ExpiryContext`.

As a result, if the user stays on the `<DOMAIN>/payin/<UUID>` page long enough, the session will eventually expire.


## Deploy on Vercel

This project is deployed on Vercel and can be accessed at [https://tzetzo-hosted-payment-page-hpp.vercel.app/](https://tzetzo-hosted-payment-page-hpp.vercel.app/).

