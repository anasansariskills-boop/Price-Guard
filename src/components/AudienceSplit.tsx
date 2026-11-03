import React from 'react';

export const AudienceSplit: React.FC = () => {
  return (
    <section className="py-20 border-b border-[#E1E3DD] bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-12">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#BE825B] mb-2">
            Target Hospitality Sectors
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#202923] text-balance">
            Engineered for high-volume hospitality purchasing.
          </h2>
          <p className="mt-3 text-base text-[#202923]/80 leading-relaxed">
            One unified platform that understands culinary ingredients as accurately as commercial linen contracts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* For Restaurants */}
          <div className="border border-[#E1E3DD] rounded-lg overflow-hidden bg-[#F8F7F3] flex flex-col">
            <div className="relative aspect-4/3 overflow-hidden bg-neutral-200">
              <img
                src="/src/assets/images/restaurant_kitchen_prep_1793624698177.jpg"
                alt="Restaurant chef inspecting culinary poultry and produce"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-7 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#214B3D] mb-1">
                  For Restaurants & Culinary Groups
                </div>
                <h3 className="text-lg font-bold text-[#202923] mb-2">
                  Keep a closer eye on ingredient costs and supplier pricing across your locations.
                </h3>
                <p className="text-sm text-[#202923]/75 leading-relaxed">
                  Catch subtle price increases on meat, seafood, dairy, produce, and specialty dry goods before they impact your kitchen prime costs.
                </p>
              </div>

              <div className="pt-4 border-t border-[#E1E3DD] text-xs text-[#202923]/60">
                Ideal for independent restaurant groups, multi-unit concepts, and foodservice operators.
              </div>
            </div>
          </div>

          {/* For Hotels */}
          <div className="border border-[#E1E3DD] rounded-lg overflow-hidden bg-[#F8F7F3] flex flex-col">
            <div className="relative aspect-4/3 overflow-hidden bg-neutral-200">
              <img
                src="/src/assets/images/hotel_hospitality_suite_1793624697686.jpg"
                alt="Luxury hotel bedroom with fresh percale bed linen"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-7 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#214B3D] mb-1">
                  For Hotels & Hospitality Management
                </div>
                <h3 className="text-lg font-bold text-[#202923] mb-2">
                  Review food, beverage, housekeeping, and operating-supply invoices in one place.
                </h3>
                <p className="text-sm text-[#202923]/75 leading-relaxed">
                  Audit guest amenity shipments, commercial linen replacements, dishwashing chemicals, and banquet food invoices against annual vendor agreements.
                </p>
              </div>

              <div className="pt-4 border-t border-[#E1E3DD] text-xs text-[#202923]/60">
                Ideal for boutique hotel properties, hotel groups, and hospitality asset managers.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
