import { useEffect, useState } from 'react'
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore'
import { db } from 'firebase.config'
import { toast } from 'react-toastify'
import Spinner from 'components/Spinner'
import ListingItem from 'components/ListingItem'
import { IListing } from 'utils/SharedUtils'

const Offers: React.FC = () => {
  const [listings, setListings] = useState<IListing[]>([] as IListing[])
  const [lastFetchListing, setLastFetchListing] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const fetchMaxResults = 10

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
          limit(fetchMaxResults)
        )

        // Execute the query
        const querySnap = await getDocs(q)

        const lastVisible = querySnap.docs[querySnap.docs.length - 1]
        setLastFetchListing(lastVisible)

        const listings = [] as IListing[]

        querySnap.forEach(doc => {
          return listings.push({
            id: doc.id,
            ...(doc.data() as IListing),
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

  // Pagination / Load More
  const onFetchMoreListings = async () => {
    try {
      // Get references
      const listingsRef = collection(db, 'listings')

      // Create a query
      const q = query(
        listingsRef,
        where('offer', '==', true),
        orderBy('timestamp', 'desc'),
        startAfter(lastFetchListing),
        limit(fetchMaxResults)
      )

      // Execute the query
      const querySnap = await getDocs(q)

      const lastVisible = querySnap.docs[querySnap.docs.length - 1]
      setLastFetchListing(lastVisible)

      const listings = [] as IListing[]

      querySnap.forEach(doc => {
        return listings.push({
          id: doc.id,
          ...(doc.data() as IListing),
        })
      })

      setListings(prevState => [...prevState, ...listings])
      setIsLoading(false)
    } catch (error) {
      toast.error('Could not fetch listings')
    }
  }

  return (
    <div className='category'>
      <header>
        <p className='pageHeader'>Offers</p>
      </header>

      {isLoading ? (
        <Spinner />
      ) : listings && listings.length > 0 ? (
        <>
          <main>
            <ul className='categoryListings'>
              {listings.map(listing => (
                <ListingItem key={listing.id} listing={listing} />
              ))}
            </ul>
          </main>

          <br />
          <br />
          {lastFetchListing && (
            <p className='loadMore' onClick={onFetchMoreListings}>
              Load more
            </p>
          )}
        </>
      ) : (
        <p>There are no current offers</p>
      )}
    </div>
  )
}

export default Offers
