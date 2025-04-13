import React from "react";

import { maskString } from "@/helpers/mask-string";

interface AddressDetailsProps {
  address: string;
  currency: string;
  onCopy: (value: string, type: string) => void;
  copiedItem: string;
}

const AddressDetails = React.memo(
  ({ address, currency, onCopy, copiedItem }: AddressDetailsProps) => (
    <div className="text-sm flex justify-between items-center -mt-2 pb-3 text-gray-700">
      <span>{currency} address</span>
      <div className="space-x-4">
        <span className="font-semibold">{maskString(address)}</span>
        <span
          className="text-blue-500 cursor-pointer inline-block w-[45px] text-right"
          onClick={() => onCopy(address, "address")}
        >
          {copiedItem === "address" ? "Copied!" : "Copy"}
        </span>
      </div>
    </div>
  )
);

AddressDetails.displayName = "AddressDetails";

export default AddressDetails;
