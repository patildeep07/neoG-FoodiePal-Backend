const express = require('express')
const router = express.Router()

const {Restaurant} = require('../models/restaurants.model')
const {User} = require('../models/users.model')


// 1. Create a Restaurant - API

const createRestaurant = async (restaurantDetails) => {
  try{
    const newRestaurant = await Restaurant(restaurantDetails)

    await newRestaurant.save()

    return newRestaurant
  } catch(error){
    throw error
  }
}


router.post('/', async (req, res) => {
  try{
    const newRestaurant = await createRestaurant(req.body)

    if(newRestaurant) {
      res.json({message:'Restaurant added', newRestaurant})
    } 
  } catch(error){
    res.status(500).json({error:'Failed to add restaurant'})
  }
})



// 3. Read All Restaurants

const readAllRestaurants = async () => {
  try {
    const restaurants = await Restaurant.find()
    return restaurants
  } catch (error) {
    throw error
  }
}

router.get('/', async (req, res) => {
  try {
    const restaurants = await readAllRestaurants()

    if (restaurants) {
      res.json({restaurants})
    } else {
      res.status(402).json({error:'Failed to retrieve restaurants'})
    }
  } catch (error) {
    res.status(500).json({error:'Failed to fetch data'})
  }
})

// 4. Read Restaurants by Cuisine

const readRestaurantsByCuisine = async (givenCuisine) => {
  try {
    // const foundRestaurants = await Restaurant.find({cuisine:givenCuisine }).collation({locale: "en", strength: 2}) // Takes a lot of time to load

    const foundRestaurants = await Restaurant.find({cuisine:{'$regex': givenCuisine,$options:'i'} }) // Using a regex expression for insensitive cases

    return foundRestaurants
  } catch (error) {
    throw error
  }
}

router.get('/cuisine/:cuisineType', async (req, res) => {
  try {
    const foundRestaurants = await readRestaurantsByCuisine(req.params.cuisineType)

    if (foundRestaurants.length > 0) {
      res.json({foundRestaurants})
    } else {
      res.status(402).json({error:'No restuarants serve this cuisine'})
    }
      
  } catch (error) {
    res.status(500).json({error:'Failed to fetch data'})
  }
})

// 5. Updating a Restaurant

const updateRestaurant = async (givenRestaurantId, updateData) => {
  try {
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(givenRestaurantId, updateData, {new:true})

    return updatedRestaurant
  } catch (error) {
    throw error
  }
}

router.post('/:restaurantId', async (req, res)=> {
  try {
    const updatedRestaurant = await updateRestaurant(req.params.restaurantId, req.body)

    if (updatedRestaurant) {
      res.json({updatedRestaurant})
    }
  } catch (error) {
    res.status(402).json({error:'Unable to find the movie to be updated'})
  }
})

// 6.  Delete a Restaurant by ID

const deleteRestaurant = async (restaurantId) => {
  try {
    const deletedRestaurant = await Restaurant.findByIdAndDelete(restaurantId)

    return deletedRestaurant
  } catch (error) {
    throw error
  }
}

router.delete('/:restaurantId', async (req, res) => {
  try {
    const deletedRestaurant = await deleteRestaurant(req.params.restaurantId)

    if (deletedRestaurant) {
      res.json({deletedRestaurant})
    }
  } catch (error) {
    res.status(402).json({error:"Restaurant not found"})
  }
})

// 7. Search Restaurants by Location

const searchRestaurantsByLocation = async (givenLocation) => {
  try {
    const foundRestaurants = await Restaurant.find({city: {'$regex': givenLocation, $options:'i'}})

    return foundRestaurants
  } catch (error) {
    throw error
  }
}

router.get('/search', async (req,res) => {
  try {
    const {location} = req.query
    const foundRestaurants = await searchRestaurantsByLocation(location)


    if (foundRestaurants.length > 0) {
      res.json({foundRestaurants})
    } else {
      res.status(402).json({error:'No restaurants in this location'})
    }
  } catch (error) {
    res.status(500).json({error:'Failed to fetch data'})
  }
})

// 8. Filter Restaurants by Rating

const filterRestaurantsByRating = async (givenRating) => {
  try {
    const filteredRestaurants = await Restaurant.find({rating: {$gte:givenRating }})

    return filteredRestaurants
  } catch (error) {
    throw error
  }
}

router.get('/rating/:minRating', async (req,res) => {
  try {
    const filteredRestaurants = await filterRestaurantsByRating(req.params.minRating)

    if(filteredRestaurants.length > 0) {
      res.json({filteredRestaurants})
    } else {
      res.staus(404).json({error:'No movies exists above this rating'})
    }
  } catch (error) {
    res.status(404).json({error:'No movies exists above this rating'})
  }
})

// 9. Adding a Dish to a Restaurant's Menu

const addDishToMenu = async (givenRestaurantId, givenDish) => {
  try {
    const foundRestaurant = await Restaurant.findById(givenRestaurantId)

    if (foundRestaurant) {
      const pushDish = foundRestaurant.menu.push(givenDish)

      await foundRestaurant.save()

      const updatedRestaurant = await Restaurant.findById(givenRestaurantId)
      return updatedRestaurant
    } else {
      console.log('Restaurant not found')
    }
  } catch (error) {
    throw error
  }
}

router.post('/:restaurantId/menu', async(req, res) => {
  try {
    const updatedRestaurant = await addDishToMenu(req.params.restaurantId, req.body)

    if (updatedRestaurant) {
      res.json({updatedRestaurant})
    }
  } catch (error) {
    res.status(404).json({error:'Resttaurant not found'})
  }
})

// 10. Remove a Dish from a Restaurant's Menu

const removeDishFromMenu = async (givenRestaurantId, givenDishName) => {
  try {
    const foundRestaurant = await Restaurant.findById(givenRestaurantId)


    if (foundRestaurant) {
      const dishToKeep = foundRestaurant.menu.filter(({itemName}) => itemName !== givenDishName)

      const dishToRemove = foundRestaurant.menu.find(({itemName}) => itemName === givenDishName)

      // const updatedRestaurant = await findByIdAndUpdate(givenRestaurantId, {menu: dishUpdated})


      foundRestaurant.menu = dishToKeep
      await foundRestaurant.save()

      return dishToRemove
    } else {
      console.log('Restaurant not found')
    }
  } catch (error) {
    throw error
  }
}

router.delete('/:restaurantId/menu/:dishName', async (req, res) => {
  try {
    const dishRemoved = await removeDishFromMenu(req.params.restaurantId, req.params.dishName)

    if (dishRemoved) {
      res.json({message:'Dish removed',dishRemoved})
    } else {
      res.status(404).json({error:"Dish not found"})
    }
  } catch (error) {
    res.status(404).json({error:"Restaurant not found"})
  }
})

// 11. Add a User Review and Rating for a Restaurant

const addRestaurantReviewAndRating = async (restaurantId, userId, userRating, userReview) => {
  try {
    const foundRestaurant = await Restaurant.findById(restaurantId)

    if (foundRestaurant) {
      const review = {
        user: userId,
        rating: userRating,
        text: userReview
      }

      foundRestaurant.reviews.push(review)

      const avgRating = foundRestaurant.reviews.reduce((acc,review)=> acc+review.rating,0)/foundRestaurant.reviews.length

      foundRestaurant.averageRating = avgRating

      await foundRestaurant.save()

      const updatedRestaurant = await Restaurant.findById(restaurantId).populate('reviews.user','username profilePicture')

      return updatedRestaurant
      
    } else {
      throw new Error('Restaurant not found')
    }
  } catch (error) {
    throw error
  }
}

router.post('/:restaurantId/reviews', async (req, res) => {
  try {
    const {userId,userRating, userReview } = req.body
    const updatedRestaurant = await addRestaurantReviewAndRating(req.params.restaurantId, userId,userRating, userReview)

    if (updatedRestaurant) {
      res.json({updatedRestaurant})
    }
  } catch (error) {
    res.status(404).json({error:'Restaurant not found'})
  }
})

// 12. Retrieve User Reviews for a Restaurant

const getUserReviewsForRestaurant = async (givenRestaurantId) => {
  try{
    const foundRestaurant = await Restaurant.findById(givenRestaurantId).populate('reviews.user','username profilePicture')

    return foundRestaurant.reviews
  } catch (error) {
    throw error
  }
}

router.get('/:restaurantId/reviews', async (req,res) => {
  try {
    const userReviews = await getUserReviewsForRestaurant(req.params.restaurantId)

    if (userReviews.length > 0) {
      res.json({userReviews})
    } 
  } catch (error) { 
    res.status(404).json({error:'No reviews exist for this restaurant'})
  }
})


// Dynamic Routes to be defined at the end after general one's
// 2. Read a Restaurant

const readRestaurant = async (givenRestaurantName) => {
  try {
    const foundRestaurant = await Restaurant.findOne({restaurantName: {'$regex' :givenRestaurantName, $options:'i'}}) // Using a regex expression for insensitive cases

    if (foundRestaurant) {
      return foundRestaurant
    }
  } catch (error) {
    throw error
  }
}

router.get('/:restaurantName', async (req, res) => {
  try {
    const foundRestaurant = await readRestaurant(req.params.restaurantName)

    if (foundRestaurant) {
      res.json({message:'Found restaurant:', foundRestaurant})
    } else {
      res.status(402).json({error:'Restaurant not found'})
    }

  } catch (error){
    res.status(500).json({error:'Failed to fetch data'})
  }
})

// Exporting router

module.exports = router