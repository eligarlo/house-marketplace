import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { collection, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore'
import { db } from 'firebase.config'
import { toast } from 'react-toastify'
import Spinner from 'components/Spinner'
import ListingItem from 'components/ListingItem'
import { IListing } from 'utils/SharedUtils'

const Offers: React.FC = () => {
  const [listings, setListings] = useState<IListing[]>([] as IListing[])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const params = useParams()

  useEffect(() => {
    const fetchListings = async () => {
      try {
        // Get references
        const listingsRef = collection(db, 'listings')

        // Create a query
        const q = query(
          listingsRef,
          where('offer', '==', true),
          orderBy('timestamp', 'desc'),
          limit(10)
        )

        // Execute the query
        const querySnap = await getDocs(q)

        const listings: any = []

        querySnap.forEach(doc => {
          return listings.push({
            id: doc.id,
            ...doc.data(),
          })
        })

        setListings(listings)
        setIsLoading(false)
      } catch (error) {
        toast.error('Could not fetch listings')
      }
    }

    fetchListings()
  }, [])

  return (
    <div className='category'>
      <header>
        <p className='pageHeader'>Offers</p>
      </header>

      {isLoading ? (
        <Spinner />
      ) : listings && listings.length > 0 ? (
        <main>
          <ul className='categoryListings'>
            {listings.map(listing => (
              <ListingItem key={listing.id} listing={listing} />
            ))}
          </ul>
        </main>
      ) : (
        <p>There are no current offers</p>
      )}
    </div>
  )
}

export default Offers
