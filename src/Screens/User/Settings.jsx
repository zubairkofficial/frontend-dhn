import React from "react";
import ChangePassword from "./ChangePass";
import ChangeLogo from "./ChangeLogo";

const Settings = () => {
  return (
    <section className="bg-white ">
      <div className="flex flex-col lg:flex-row justify-between">
        <div className="w-full px-5 xl:pl-12">
          
          <ChangePassword />
          <ChangeLogo />
        </div>
      </div>
    </section>
  );
};

export default Settings;
