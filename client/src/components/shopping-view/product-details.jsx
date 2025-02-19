import { StarIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";
import { setProductDetails } from "@/store/shop/products-slice";
import { Label } from "../ui/label";
import StarRatingComponent from "../common/star-rating";
import { useEffect, useState } from "react";
import { addReview, getReviews } from "@/store/shop/review-slice";

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [isGiftWrapped, setIsGiftWrapped] = useState(false); // New state for gift wrapping
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);

  const { toast } = useToast();

  function handleRatingChange(getRating) {
    setRating(getRating);
  }

  function handleAddToCart(getCurrentProductId, getTotalStock) {
    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast({
            title: `Only ${getQuantity} quantity can be added for this item`,
            variant: "destructive",
          });
          return;
        }
      }
    }
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
        giftWrapped: isGiftWrapped, // Include gift wrapping information
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product added to cart" + (isGiftWrapped ? " with gift wrapping!" : "!"),
        });
      }
    });
  }

  function handleDialogClose() {
    setOpen(false);
    dispatch(setProductDetails());
    setRating(0);
    setReviewMsg("");
    setIsGiftWrapped(false); // Reset gift wrap option
  }

  function handleAddReview() {
    dispatch(
      addReview({
        productId: productDetails?._id,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      })
    ).then((data) => {
      if (data.payload.success) {
        setRating(0);
        setReviewMsg("");
        dispatch(getReviews(productDetails?._id));
        toast({
          title: "Review added successfully!",
        });
      }
    });
  }

  useEffect(() => {
    if (productDetails !== null) dispatch(getReviews(productDetails?._id));
  }, [productDetails]);

  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) /
        reviews.length
      : 0;

      return (
        <Dialog open={open} onOpenChange={handleDialogClose}>
          <DialogContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8 max-w-[95vw] md:max-w-[80vw] lg:max-w-[70vw] bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg shadow-xl">
            
            {/* Product Image */}
            <div className="relative overflow-hidden rounded-lg">
              <img
                src={productDetails?.image}
                alt={productDetails?.title}
                width={600}
                height={600}
                className="aspect-square w-full object-cover rounded-lg transition-transform duration-500 hover:scale-105"
              />
            </div>
    
            {/* Product Details */}
            <div className="flex flex-col">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-pink-700">
                {productDetails?.title}
              </h1>
              <p className="text-pink-600 text-lg sm:text-xl mt-3 mb-5">
                {productDetails?.description}
              </p>
    
              <div className="flex items-center justify-between">
                <p className={`text-2xl sm:text-3xl font-bold text-pink-700 ${productDetails?.salePrice > 0 ? "line-through" : ""}`}>
                  ₹{productDetails?.price}
                </p>
                {productDetails?.salePrice > 0 && (
                  <p className="text-2xl font-bold text-green-600">
                    ₹{productDetails?.salePrice}
                  </p>
                )}
              </div>
    
              {/* Rating */}
              <div className="flex items-center gap-2 mt-2">
                <StarRatingComponent rating={averageReview} />
                <span className="text-gray-600">({averageReview.toFixed(2)})</span>
              </div>
    
              {/* Gift Wrapping Checkbox */}
              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="giftWrap"
                  checked={isGiftWrapped}
                  onChange={() => setIsGiftWrapped(!isGiftWrapped)}
                  className="w-5 h-5 accent-pink-500"
                />
                <label htmlFor="giftWrap" className="text-pink-700 text-lg">
                  Add Gift Wrapping
                </label>
              </div>
    
              {/* Add to Cart Button */}
              <div className="mt-6">
                {productDetails?.totalStock === 0 ? (
                  <Button className="w-full opacity-60 cursor-not-allowed bg-gray-300 text-white">
                    Out of Stock
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
                    onClick={() => handleAddToCart(productDetails?._id, productDetails?.totalStock)}
                  >
                    Add to Cart
                  </Button>
                )}
              </div>
    
              <Separator className="my-6" />
    
              {/* Review Section */}
              <div className="max-h-[300px] overflow-auto">
                <h2 className="text-xl font-bold mb-4 text-pink-700">Reviews</h2>
                <div className="space-y-4">
                  {reviews?.length > 0 ? (
                    reviews.map((reviewItem, index) => (
                      <div className="flex gap-4" key={index}>
                        <Avatar className="w-10 h-10 border">
                          <AvatarFallback>
                            {reviewItem?.userName[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <h3 className="font-bold">{reviewItem?.userName}</h3>
                          <StarRatingComponent rating={reviewItem?.reviewValue} />
                          <p className="text-gray-600">{reviewItem.reviewMessage}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600">No Reviews</p>
                  )}
                </div>
    
                {/* Add Review */}
                <div className="mt-6 flex flex-col gap-2">
                  <Label className="text-pink-700">Write a review</Label>
                  <div className="flex gap-1">
                    <StarRatingComponent rating={rating} handleRatingChange={handleRatingChange} />
                  </div>
                  <Input
                    name="reviewMsg"
                    value={reviewMsg}
                    onChange={(event) => setReviewMsg(event.target.value)}
                    placeholder="Write a review..."
                  />
                  <Button
                    className="bg-pink-500 hover:bg-pink-600 text-white"
                    onClick={handleAddReview}
                    disabled={reviewMsg.trim() === ""}
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      );
    };
    
    export default ProductDetailsDialog;
