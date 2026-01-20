"use client";

import { useUser } from "@/lib/useUser";
import { useState, useEffect } from "react";

interface ParentDetails {
  parent_type: string;
  name: string;
  occupation: string;
  organisation: string;
  email: string;
  phone_country_code: string;
  phone_number: string;
}

interface ParentGuardianDetailsFormProps {
  isEditing: boolean;
}

export default function ParentGuardianDetailsForm({
  isEditing,
}: ParentGuardianDetailsFormProps) {
  const { user, isLoading } = useUser();
  const [fatherDetails, setFatherDetails] = useState<ParentDetails>({
    parent_type: "FATHER",
    name: "",
    occupation: "",
    organisation: "",
    email: "",
    phone_country_code: "+91",
    phone_number: "",
  });
  const [motherDetails, setMotherDetails] = useState<ParentDetails>({
    parent_type: "MOTHER",
    name: "",
    occupation: "",
    organisation: "",
    email: "",
    phone_country_code: "+91",
    phone_number: "",
  });
  const [guardianDetails, setGuardianDetails] = useState<ParentDetails>({
    parent_type: "GUARDIAN",
    name: "",
    occupation: "",
    organisation: "",
    email: "",
    phone_country_code: "+91",
    phone_number: "",
  });

  // Populate form with user data
  useEffect(() => {
    const parentData = user?.parent_details;

    if (Array.isArray(parentData)) {
      const father = parentData.find(
        (parent) => parent.parent_type === "FATHER" || parent.parent_type === "Father"
      );
      const mother = parentData.find(
        (parent) => parent.parent_type === "MOTHER" || parent.parent_type === "Mother"
      );
      const guardian = parentData.find(
        (parent) => parent.parent_type === "GUARDIAN" || parent.parent_type === "Guardian"
      );

      if (father) {
        setFatherDetails({
          parent_type: "FATHER",
          name: father.name || "",
          occupation: father.occupation || "",
          organisation: father.organisation || "",
          email: father.email || "",
          phone_country_code: father.phone_country_code || "+91",
          phone_number: father.phone_number || "",
        });
      }

      if (mother) {
        setMotherDetails({
          parent_type: "MOTHER",
          name: mother.name || "",
          occupation: mother.occupation || "",
          organisation: mother.organisation || "",
          email: mother.email || "",
          phone_country_code: mother.phone_country_code || "+91",
          phone_number: mother.phone_number || "",
        });
      }

      if (guardian) {
        setGuardianDetails({
          parent_type: "GUARDIAN",
          name: guardian.name || "",
          occupation: guardian.occupation || "",
          organisation: guardian.organisation || "",
          email: guardian.email || "",
          phone_country_code: guardian.phone_country_code || "+91",
          phone_number: guardian.phone_number || "",
        });
      }
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Father's Details Section */}
      <div className="card bg-base-100 shadow border border-base-300">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-4">
            <i className="material-icons text-blue-600">person</i>
            <h2 className="text-xl font-semibold">Father's Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                placeholder="Father's Name"
                value={fatherDetails.name}
                onChange={(e) =>
                  setFatherDetails({ ...fatherDetails, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Occupation</label>
              <input
                type="text"
                placeholder="Occupation"
                value={fatherDetails.occupation}
                onChange={(e) =>
                  setFatherDetails({ ...fatherDetails, occupation: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Organisation</label>
              <input
                type="text"
                placeholder="Organisation Name"
                value={fatherDetails.organisation}
                onChange={(e) =>
                  setFatherDetails({ ...fatherDetails, organisation: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Mobile Number</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={fatherDetails.phone_country_code}
                  onChange={(e) =>
                    setFatherDetails({
                      ...fatherDetails,
                      phone_country_code: e.target.value,
                    })
                  }
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  disabled={!isEditing}
                />
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={fatherDetails.phone_number}
                  onChange={(e) =>
                    setFatherDetails({ ...fatherDetails, phone_number: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email ID</label>
              <input
                type="email"
                placeholder="father@email.com"
                value={fatherDetails.email}
                onChange={(e) =>
                  setFatherDetails({ ...fatherDetails, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mother's Details Section */}
      <div className="card bg-base-100 shadow border border-base-300">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-4">
            <i className="material-icons text-pink-600">person</i>
            <h2 className="text-xl font-semibold">Mother's Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                placeholder="Mother's Name"
                value={motherDetails.name}
                onChange={(e) =>
                  setMotherDetails({ ...motherDetails, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Occupation</label>
              <input
                type="text"
                placeholder="Occupation"
                value={motherDetails.occupation}
                onChange={(e) =>
                  setMotherDetails({ ...motherDetails, occupation: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Organisation</label>
              <input
                type="text"
                placeholder="Organisation Name"
                value={motherDetails.organisation}
                onChange={(e) =>
                  setMotherDetails({ ...motherDetails, organisation: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Mobile Number</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={motherDetails.phone_country_code}
                  onChange={(e) =>
                    setMotherDetails({
                      ...motherDetails,
                      phone_country_code: e.target.value,
                    })
                  }
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  disabled={!isEditing}
                />
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={motherDetails.phone_number}
                  onChange={(e) =>
                    setMotherDetails({ ...motherDetails, phone_number: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email ID</label>
              <input
                type="email"
                placeholder="mother@email.com"
                value={motherDetails.email}
                onChange={(e) =>
                  setMotherDetails({ ...motherDetails, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Guardian Details Section */}
      <div className="card bg-base-100 shadow border border-base-300">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-4">
            <i className="material-icons text-purple-600">family_restroom</i>
            <h2 className="text-xl font-semibold">Guardian Details (Optional)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                placeholder="Guardian's Name"
                value={guardianDetails.name}
                onChange={(e) =>
                  setGuardianDetails({ ...guardianDetails, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Occupation</label>
              <input
                type="text"
                placeholder="Occupation"
                value={guardianDetails.occupation}
                onChange={(e) =>
                  setGuardianDetails({ ...guardianDetails, occupation: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Organisation</label>
              <input
                type="text"
                placeholder="Organisation Name"
                value={guardianDetails.organisation}
                onChange={(e) =>
                  setGuardianDetails({
                    ...guardianDetails,
                    organisation: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Mobile Number</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={guardianDetails.phone_country_code}
                  onChange={(e) =>
                    setGuardianDetails({
                      ...guardianDetails,
                      phone_country_code: e.target.value,
                    })
                  }
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  disabled={!isEditing}
                />
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={guardianDetails.phone_number}
                  onChange={(e) =>
                    setGuardianDetails({
                      ...guardianDetails,
                      phone_number: e.target.value,
                    })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email ID</label>
              <input
                type="email"
                placeholder="guardian@email.com"
                value={guardianDetails.email}
                onChange={(e) =>
                  setGuardianDetails({ ...guardianDetails, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
