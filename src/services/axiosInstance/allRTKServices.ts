import { aboutService } from "../about.service";
import { authService } from "../auth.service";
import { blogService } from "../blog.service";
import { categoryService } from "../category.service";
import { goongService } from "../goong.service";
import { manuProcessService } from "../manuProcess.service";
import { policyService } from "../policy.service";
import { productService } from "../product.service";
import { siteConfigService } from "../siteConfig.service";

export const allRTKServices = {
  productService,
  blogService,
  authService,
  aboutService,
  categoryService,
  manuProcessService,
  policyService,
  goongService,
  siteConfigService,
};
