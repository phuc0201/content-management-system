import { aboutService } from "../about.service";
import { authService } from "../auth.service";
import { blogService } from "../blog.service";
import { categoryService } from "../category.service";
import { productService } from "../product.service";

export const allRTKServices = {
  productService,
  blogService,
  authService,
  aboutService,
  categoryService,
};
