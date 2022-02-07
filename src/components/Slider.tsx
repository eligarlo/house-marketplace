import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from 'firebase.config'
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/swiper-bundle.css'
import Spinner from 'components/Spinner'
import { IListing } from 'utils/SharedUtils'
import { formatPriceNumber } from 'utils/CommonFunctions'
SwiperCore.use([Navigation, Pagination, Scrollbar, A11y])

const Slider: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true)
  const [listings, setListings] = useState<IListing[]>([] as IListing[])

  const navigate = useNavigate()

  useEffect(() => {
    const fetchListings = async () => {
      const listingsRef = collection(db, 'listings')
      const q = query(listingsRef, orderBy('timestamp', 'desc'), limit(5))
      const querySnap = await getDocs(q)

      let listings = [] as IListing[]

      querySnap.forEach(doc => {
        let data = doc.data() as IListing
        return listings.push({
          id: doc.id,
          ...data,
        })
      })

      setListings(listings)
      setLoading(false)
    }

    fetchListings()
  }, [])

  const handleOnClick = (listing: IListing) => {
    navigate(`/category/${listing.type}/${listing.id}`)
  }

  if (loading) {
    return <Spinner />
  }

  if (listings.length === 0) {
    return <></>
  }

  return (
    listings && (
      <>
        <p className='exploreHeading'>Recommended</p>
        <Swiper slidesPerView={1} pagination={{ clickable: true }}>
          {listings.map(listing => (
            <SwiperSlide key={listing.id} onClick={() => handleOnClick(listing)}>
              <div
                style={{
                  background: `url(${listing.imageUrls[0]}) center no-repeat`,
                  backgroundSize: 'cover',
                }}
                className='swiperSlideDiv'
              >
                <p className='swiperSlideText'>{listing.name}</p>
                <p className='swiperSlidePrice'>
                  $
                  {(listing.discountedPrice && formatPriceNumber(listing.discountedPrice)) ??
                    formatPriceNumber(listing.regularPrice)}{' '}
                  {listing.type === 'rent' && '/ month'}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </>
    )
  )
}

export default Slider
