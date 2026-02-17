import React from "react";
import { Button } from "@/components/core/Button";

interface HeaderProps {
  startStopwatch: () => void;
  pauseStopwatch: () => void;
}

const Header: React.FC<HeaderProps> = ({ startStopwatch, pauseStopwatch }) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Classroom Observation Notes</h1>
      <div className="flex space-x-3">
        <Button type="button" appearance="outline" onClick={startStopwatch}>
          Start Timer
        </Button>
        <Button type="button" appearance="outline" onClick={pauseStopwatch}>
          Pause Timer
        </Button>
      </div>
    </div>
  );
};

export default Header;
