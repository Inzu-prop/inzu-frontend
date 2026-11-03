import { forwardRef } from "react";
import { cx } from "@/utils/cx";

const Container = forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(function Container({ className, children, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cx(
        "mx-auto w-full max-w-[1600px] px-4 sm:px-6 xl:px-8",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});

export default Container;
