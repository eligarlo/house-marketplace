import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { collection, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore'
import { db } from 'firebase.config'
import { toast } from 'react-toastify'
import Spinner from 'components/Spinner'
import { IListing } from 'utils/SharedUtils'

const Category: React.FC = () => {
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
          where('type', '==', params.categoryName),
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
  }, [params.categoryName])

  return (
    <div className='category'>
      <header>
        <p className='pageHeader'>Places for {params.categoryName === 'rent' ? 'rent' : 'sale'}</p>
      </header>

      {isLoading ? (
        <Spinner />
      ) : listings && listings.length > 0 ? (
        <main>
          <ul className='categoryListings'>
            {listings.map(listing => (
              <h3>{listing.name}</h3>
            ))}
          </ul>
        </main>
      ) : (
        <p>No listings for {params.categoryName}</p>
      )}
    </div>
  )
}

export default Category
