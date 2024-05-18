import React, { createContext, useEffect, useState} from "react";
// import all_product from "../Components/Assets/all_product";


//  import Cartitems from "../Components/Cartitems/Cartitems";


export const ShopContext = createContext(null);
const getDefaultCart = ()=> {
    let cart = {};
    for (let index = 0; index < 300+1; index++) {
        cart[index] = 0;
    }
    return cart;
}

const ShopContextProvider = (props) => {

    const [all_product,setAll_Product] = useState([]);

    const [cartItems,setCartItems] = useState(getDefaultCart())

    useEffect(()=>{
        fetch('http://localhost:4000/allproducts')
        .then((response)=>response.json())
        .then((data)=>setAll_Product(data))

        if (localStorage.getItem('auth-token')) {
            fetch('http://localhost:4000/getcart', {
                method: 'POST',
                headers: {
                    Accept: 'application/json', // Fixed content-type to application/json
                    'auth-token': localStorage.getItem('auth-token'),
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Received data:', data); // Log the received data
                setCartItems(data);
            })
            .catch(error => {
                console.error('Fetch error:', error); // Added catch block for error handling
            });
        }
        
    },[])
    
    
    const addToCart = (itemId) => {
        console.log('Adding item to cart:', itemId); // Log the itemId
        setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
    
        if (localStorage.getItem('auth-token')) {
            fetch('http://localhost:4000/addtocart', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'auth-token': `${localStorage.getItem('auth-token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "itemId": itemId })
            })
            .then((response) => response.json())
            .then((data) => console.log('Response Data:', data))
            .catch((error) => console.error('Error:', error));
        }
    };
    
    

    const removeFromCart = (itemId) => {
        setCartItems((prev)=>({...prev,[itemId]:prev[itemId]-1}));
        if(localStorage.getItem('auth-token')){
            fetch('http://localhost:4000/removefromcart', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'auth-token': `${localStorage.getItem('auth-token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "itemId": itemId })
            })
            .then((response) => response.json())
            .then((data) => console.log('Response Data:', data))
            .catch((error) => console.error('Error:', error));

        }
    }
    // const getTotalCartAmount = (cartItems, all_product) => {
    //     let totalAmount = 0;
    //     for (const item in cartItems) {
    //         if (cartItems[item] > 0) {
    //             let itemInfo = all_product.find((product) => product.id === Number(item));
    //             totalAmount+= cartItems[item] * itemInfo.new_price;
    //         }
    //     }
    //     return totalAmount;
    // }
    const getTotalCartAmount = () => {
        return Object.keys(cartItems).reduce((total, itemId) => {
          const item = all_product.find(product => product.id === parseInt(itemId));
          return total + (item ? item.new_price * cartItems[itemId] : 0);
        }, 0);
      };
    
    const getTotalCartItems = ()=>{
        let totalItem = 0;
        for(const item in cartItems){
            if(cartItems[item]>0){
                totalItem+= cartItems[item];
            }
        }
        return totalItem;
    }

    const contextValue = {getTotalCartItems,getTotalCartAmount,all_product, cartItems, addToCart , removeFromCart}
    
     return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
     )
}

export default ShopContextProvider;