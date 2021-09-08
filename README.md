![Final-Result](https://lh3.googleusercontent.com/t0wQUYAandIwGDXHwMF0CwHdQm_su8ZnnxD5YlzSphupCipRyyzcGLHxKCldyMyDgTAQSTjDBXVwtF1GXa6XZv1LobE7onIe6ZWjaHmq771ynhwvbMfimNi2VMXT3tJrXKRGtJRQ8KD2_LZpQTUixKaimsIqr1PdzE6HAFOwdQj05wAfbNj6hqKstNclYTvKzEKIKEZm1I61p6Il4_3gt3ffTfF0WbFku6z929xPiUBNzbSzsiEkyeRCBPRJoNpQK7fJjAfsOChw_Vk0yh4H9K6JsEp9yis9AJUu0EOFUz9aZBkRR-xQnZUv4KtBID2OiWJpq48VAZhsqv1tQqUeuDUV61WSNe6BRvHDoP4RUiCZTW0bTV1bHgegN5EEWSpM3qDOY4YE2QifwHVAOhp-LikvLJnsHbJ_aLQmSqgg9wpaKIEIv95R6Kcyoq3o6ZDAfqoy8Ivhst2d9aCN2jlTQlQwOzQGmI9VNIoOIJmk7JzpMZ_-_fyCY2KsKseaoIF-h1_kaIPHlH9UCrTAFK9F99rquJXQfabCmEiIoHyog9u7zNK-uJsPT0ie0M0AGJKllk495VRvicI3Cxo7usdJqn-efW84pt5F3QfTknIzu8_wmP3d5Czh6HKuj246WAyu3r2yzAJPjkU1Nj62xCe8zuxUcGiP8sAbriyGqFAWgDJAsjqAIrYVV419xFwR0aMGWy7OR_FEU0q_s1TftTM0v6jI5w=w1408-h937-no?authuser=0)

# Subscription PayU LATAM

You can see the demo here: https://task-manager-react-a1xx50vf9-blackdeerbrand.vercel.app/ 

### IMPORTANT

This version of the pay form for subscription made for PayU only works in Colombia and Mexico
Other countries have little variations about the data that you must give to PayU

See more [here](http://developers.payulatam.com/es/api/recurring_payments.html)

As a requirement, you must have created an account in PayU or called [Administrative Module](https://secure.payulatam.com/online_account/create_account.zul)

This is made through API implementation. See more [here](http://developers.payulatam.com/es/api/recurring_payments.html)

### Build with

- [React](https://reactjs.org/)
- [Git](https://git-scm.com)
- [Material Icons](https://material-ui.com/es/components/material-icons/)
- [Material UI](https://material-ui.com/es/)
- [Material Lab](https://material-ui.com/es/components/about-the-lab/)
- [Typescript](https://www.typescriptlang.org/)
- [React-Hook-Form](https://react-hook-form.com/)
- [Axios](https://github.com/axios/axios)
- [md5](https://www.npmjs.com/package/md5)

## Features

# Last actualization : September 8, 2021

SUSCRIPTION LATAM

Hi developer, here are we going to explain how all the form of suscription from PayU ("Pagos Recurrentes" in Spanish)

!IMPORTANT => Before all this process, it's important that you have an account in the PayU page
!IMPORTANT => Also we will only working with VISA and MASTERCARD credit/debit cards (I will actualize in the future)
!IMPORTANT => This form only works for Colombia, for other countries is similar but asks from a couple of additional variables

So, let's begin!

PayU ask you for a form with the next elements:

- ID
- fullName
- Email
- Phone
- DNI (national identity card or in Spanish ""Documento nacional de identidad")
- Address
- Country
- City
- (OPTIONAL)Address 2
- (OPTIONAL)Phone 2
- (OPTIONAL)Postal Code

Credit Card / Debit Card

- fullName
- Number
- Month/Year
- CVV

!IMPORTANT => The form ID it's REALLY important, you can create as you want but that means that everytime it renders has a different ID
It's important for this case: suppose that you fill that form and it fails for any reason (Example: Invalid credit card number or CVV) that form
DOESN'T WORK ANYMORE because you already used that ID you must reload the page and re-fill that form with a NEW ID.

So, I give the data, how does it works?

PayU divides in four parts:

Plan - Client - CreditCard / Tokenize - Suscription

1. Plan => The suscription Plan (Price, for how long is valid, etc.)
2. Client => The data of the client (for minimum, fullName and email)
3. Credit Card / Tokenize => The data of the credit card and encrypt of the same (Number, CVV, Month/Year)
4. Suscription => Action of subscribe a Client with a Credit Card to a certain Plan (The combination of the three other steps)
5. (OPTIONAL)Additional Values => If you want to add more cost to the main plan (It's more used in cases of shipping products)
6. (OPTIONAL)Invoice => Payment Data

From the CRUD system of PayU, we are only going to see the CREATE part, because for the others we need that you have some ID's that PayU gives to you

But....I do not leave you without information 

See more in [my page](https://www.miciervonegro.com) or clone it (There are instructions in the code)

## How To Use

<!-- Example: -->

To clone and run this application, you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
$ git clone https://github.com/Blackdeerbrand/Task_Manager

# Install dependencies
$ npm install

# Run the app
$ npm start
```

## Acknowledgements

<!-- This section should list any articles or add-ons/plugins that helps you to complete the project. This is optional but it will help you in the future. For example: -->

- [Steps to replicate a design with only HTML and CSS](https://devchallenges-blogs.web.app/how-to-replicate-design/)
- [Node.js](https://nodejs.org/)

## Contact

- Website [www.miciervonegro.com](https://www.miciervonegro.com)
- GitHub [Blackdeerbrand](https://github.com/Blackdeerbrand)
