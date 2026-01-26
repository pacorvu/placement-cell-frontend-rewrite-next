import Link from "next/link";
import NavIcon, { IconKey } from "./NavIcon";

interface MenuItem {
  title: string;
  href: string;
  description?: string;
  icon?: IconKey;
}

interface MegaMenuProps {
  title: string;
  items: MenuItem[];
}

export default function MegaMenu({ title, items }: MegaMenuProps) {
  return (
    <div className="group relative">
      <button className="btn btn-ghost rounded-none h-full px-6 text-sm font-medium uppercase tracking-wide opacity-80 hover:opacity-100 transition-opacity flex items-center gap-1">
        {title}
        <NavIcon name="ChevronDown" className="w-4 h-4 transition-transform group-hover:rotate-180" />
      </button>

      {/* Mega Menu Dropdown */}
      <div className="absolute left-1/2 -translate-x-1/2 top-full w-[600px] 
                      invisible opacity-0 -translate-y-4 scale-95
                      group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100
                      transition-all duration-300 ease-out z-50 origin-top">
        <div className="mt-2 bg-base-100 border border-base-200 shadow-xl rounded-xl overflow-hidden p-6 grid grid-cols-2 gap-4">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-start gap-4 p-3 rounded-lg hover:bg-base-200 transition-colors group/item"
            >
              <div className="p-2 bg-primary/10 text-primary rounded-md group-hover/item:bg-primary group-hover/item:text-primary-content transition-colors">
                {item.icon && <NavIcon name={item.icon} className="w-5 h-5" />}
              </div>
              <div>
                <div className="font-semibold text-base-content group-hover/item:text-primary transition-colors">
                  {item.title}
                </div>
                {item.description && (
                  <div className="text-xs text-base-content/60 mt-1 line-clamp-2">
                    {item.description}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
