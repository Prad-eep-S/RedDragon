import "./FoodCategory.css";

const FoodCategory = ({ eachItem }) => {
  const { foodName, foodImgUrl } = eachItem;

  return (
    <li className="food-category-item">
      <div className="food-img-container">
        <img className="food-img" src={foodImgUrl} alt={foodName} />
      </div>

      <p>{foodName}</p>
    </li>
  );
};

export default FoodCategory;
