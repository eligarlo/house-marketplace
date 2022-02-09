# House Marketplace

Find and list houses for sale or for rent. This is a React / Firebase v9 project from the [React Front To Back](https://www.udemy.com/course/react-front-to-back-2022/?referralCode=4A622C7E48DB66154114) course.

## Usage

### Geolocation

The listings use Google geocoding to get the coords from the address field. You need to either rename .env.example to .env and add your Google Geocode API key OR in the **CreateListing.jsx** file you can set **geolocationEnabled** to "false" and it will add a lat/lng field to the form.

## Available Scripts

In the project directory, you can run:

```bash
yarn start
```

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.
