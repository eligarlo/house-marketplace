import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getDoc, doc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from 'firebase.config'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/swiper-bundle.css'
import Spinner from 'components/Spinner'
import shareIcon from 'assets/svg/shareIcon.svg'
import { IListing } from 'utils/SharedUtils'
import { formatPriceNumber } from 'utils/CommonFunctions'
SwiperCore.use([Navigation, Pagination, Scrollbar, A11y])

const Listing: React.FC = () => {
  const [listing, setListing] = useState<IListing>({} as IListing)
  const [loading, setLoading] = useState<boolean>(true)
  const [shareLinkCopied, setShareLinkCopied] = useState<boolean>(false)

  const navigate = useNavigate()
  const params = useParams()
  const auth = getAuth()

  useEffect(() => {
    const fetchListing = async () => {
      const docRef = params.listingId && doc(db, 'listings', params.listingId)
      const docSnap = docRef && (await getDoc(docRef))

      if (docSnap && docSnap.exists()) {
        setListing(docSnap.data() as IListing)
        setLoading(false)
      }
    }

    fetchListing()
  }, [navigate, params.listingId])

  const handleOnShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setShareLinkCopied(true)
    setTimeout(() => {
      setShareLinkCopied(false)
    }, 2000)
  }

  const attribution = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'

  if (loading) {
    return <Spinner />
  }

  return (
    <main>
      <Swiper slidesPerView={1} pagination={{ clickable: true }}>
        {listing.imageUrls.map((imageUrl, index) => (
          <SwiperSlide key={index}>
            <div
              style={{ background: `url(${imageUrl}) center no-repeat`, backgroundSize: 'cover' }}
              className='swiperSlideDiv'
            ></div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className='shareIconDiv' onClick={handleOnShare}>
        <img src={shareIcon} alt='Share' />
      </div>
      {shareLinkCopied && <p className='linkCopied'>Link Copied!</p>}

      <div className='listingDetails'>
        <p className='listingName'>
          {listing.name} - $
          {listing.offer
            ? listing.discountedPrice && formatPriceNumber(listing.discountedPrice)
            : formatPriceNumber(listing.regularPrice)}
        </p>
        <p className='listingLocation'>{listing.location}</p>
        <p className='listingType'>For {listing.type === 'rent' ? 'Rent' : 'Sale'}</p>
        {listing.offer && (
          <p className='discountPrice'>
            $
            {listing.discountedPrice &&
              formatPriceNumber(listing.regularPrice - listing.discountedPrice)}{' '}
            discount
          </p>
        )}

        <ul className='listingDetailsList'>
          <li>{listing.bedrooms > 1 ? `${listing.bedrooms} Bedrooms` : '1 Bedroom'}</li>
          <li>{listing.bathrooms > 1 ? `${listing.bathrooms} Bathrooms` : '1 Bathroom'}</li>
          <li>{listing.parking && 'Parking Spot'}</li>
          <li>{listing.furnished && 'Furnished'}</li>
        </ul>

        <p className='listingLocationTitle'>Location</p>

        <div className='leafletContainer'>
          <MapContainer
            style={{ height: '100%', width: '100%' }}
            center={[listing.geolocation.lat, listing.geolocation.lng]}
            zoom={13}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution={attribution}
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />

            <Marker position={[listing.geolocation.lat, listing.geolocation.lng]}>
              <Popup>{listing.location}</Popup>
            </Marker>
          </MapContainer>
        </div>

        {auth.currentUser?.uid !== listing.userRef && (
          <Link
            to={`/contact/${listing.userRef}?listingName=${listing.name}`}
            className='primaryButton'
          >
            Contact Landlord
          </Link>
        )}
      </div>
    </main>
  )
}

export default Listing
