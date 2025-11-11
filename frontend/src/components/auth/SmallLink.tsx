import { Link, LinkProps } from "react-router-dom";
import { cn } from "../../lib/utils";

interface SmallLinkProps extends LinkProps {
  className?: string;
}

const SmallLink = ({ className, children, ...props }: SmallLinkProps) => {
  return (
    <Link
      className={cn(
        "text-sm text-accent hover:text-accent/80 transition-smooth underline-offset-4 hover:underline",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
};

export default SmallLink;
