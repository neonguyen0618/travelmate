// Map Geoapify place categories to compatible categories for "Nearby Places"
export function mapCategoryToSearchSet(primaryCat) {
  const topLevel = primaryCat?.split(".")[0];

  switch (topLevel) {
    case "tourism":
      return "tourism|entertainment|catering|natural";

    case "natural":
      return "natural|tourism|sport";

    case "catering":
      return "catering|entertainment|tourism";

    case "accommodation":
      return "accommodation|tourism|catering";

    case "entertainment":
      return "entertainment|tourism|catering";

    case "sport":
      return "sport|entertainment|tourism";

    case "commercial":
      return "commercial|catering|tourism";

    default:
      return "tourism|entertainment|catering|natural|accommodation";
  }
}
