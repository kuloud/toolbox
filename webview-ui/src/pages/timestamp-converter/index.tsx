import { ClockAltIcon } from "@/components/icons/ClockAltIcon";
import { HorizonalArrowsIcon } from "@/components/icons/HorizonalArrowsIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { timezones } from "@/data/timezones";
import toast from "@/lib/toast";
import {
  CalendarIcon,
  ChevronDownIcon,
  ClockIcon,
  CopyIcon,
  DownloadIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Remove duplicate timezones and ensure unique values
const uniqueTimezones = timezones.reduce(
  (acc, current) => {
    const exists = acc.find((item) => item.value === current.value);
    if (!exists) {
      acc.push(current);
    }
    return acc;
  },
  [] as typeof timezones,
);

// Sort timezones by region and offset for better readability
const sortedTimezones = uniqueTimezones.sort((a, b) => {
  const regionOrder: { [key: string]: number } = {
    "America/": 1,
    "Europe/": 2,
    "Africa/": 3,
    "Asia/": 4,
    "Australia/": 5,
    "Pacific/": 6,
    "Atlantic/": 7,
    "Indian/": 8,
    "Antarctica/": 9,
    UTC: 10,
    GMT: 11,
  };

  const getRegionPriority = (value: string) => {
    for (const [prefix, priority] of Object.entries(regionOrder)) {
      if (value.startsWith(prefix)) return priority;
    }
    return 99;
  };

  const regionA = getRegionPriority(a.value);
  const regionB = getRegionPriority(b.value);

  if (regionA !== regionB) {
    return regionA - regionB;
  }

  return a.label.localeCompare(b.label);
});

// Get user's local timezone
const getUserTimezone = () => {
  try {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Try to find an exact match in our timezones
    const exactMatch = sortedTimezones.find((tz) => tz.value === userTimezone);
    if (exactMatch) return exactMatch.value;

    // Try to find a timezone in the same region
    const userRegion = userTimezone.split("/")[0];
    const regionMatch = sortedTimezones.find((tz) =>
      tz.value.startsWith(userRegion + "/"),
    );
    if (regionMatch) return regionMatch.value;

    // Fallback to Asia/Shanghai for CST +8
    if (userTimezone.includes("China") || userTimezone === "Asia/Shanghai") {
      return "Asia/Shanghai";
    }

    // Fallback to UTC
    return "UTC";
  } catch (error) {
    console.error("Error detecting timezone:", error);
    return "UTC";
  }
};

// Custom dropdown component with better focus management
function TimezoneSelect({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredTimezones = useMemo(() => {
    if (!searchTerm) return sortedTimezones;

    const searchLower = searchTerm.toLowerCase();
    return sortedTimezones.filter(
      (tz) =>
        tz.label.toLowerCase().includes(searchLower) ||
        tz.value.toLowerCase().includes(searchLower),
    );
  }, [searchTerm]);

  const selectedTimezone = sortedTimezones.find((tz) => tz.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  const handleSelect = (tzValue: string) => {
    onValueChange(tzValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
    searchInputRef.current?.focus();
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Enter" && filteredTimezones.length > 0) {
      handleSelect(filteredTimezones[0].value);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleTriggerClick}
        className="flex h-10 w-70 items-center justify-between rounded-md border border-input bg-background px-3 text-sm shadow-sm hover:bg-accent hover:text-accent-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none"
      >
        <span className="truncate">
          {selectedTimezone ? selectedTimezone.label : "Select timezone"}
        </span>
        <ChevronDownIcon className="h-4 w-4 opacity-50" />
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 w-70 rounded-md border bg-popover text-popover-foreground shadow-md">
          {/* Search Input */}
          <div className="relative border-b p-2">
            <SearchIcon className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search timezones..."
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              className="h-9 border-0 pr-8 pl-10 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground hover:text-foreground"
              >
                <XIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Timezone List */}
          <div className="max-h-75 overflow-y-auto">
            {filteredTimezones.length === 0 ? (
              <div className="px-4 py-3 text-center text-sm text-muted-foreground">
                No timezones found for "{searchTerm}"
              </div>
            ) : (
              filteredTimezones.map((tz) => (
                <button
                  key={tz.value}
                  type="button"
                  onClick={() => handleSelect(tz.value)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none ${
                    value === tz.value ? "bg-accent text-accent-foreground" : ""
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{tz.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {tz.value}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {searchTerm && filteredTimezones.length > 0 && (
            <div className="border-t p-2 text-center text-xs text-muted-foreground">
              {filteredTimezones.length} timezone
              {filteredTimezones.length !== 1 ? "s" : ""} found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function TimestampPage() {
  const [unit, setUnit] = useState<"second" | "millisecond">("second");
  // Use detected timezone instead of hardcoded one
  const [timezone, setTimezone] = useState(getUserTimezone());
  const [timestamp, setTimestamp] = useState("");
  const [date, setDate] = useState("");
  const [conversionDirection, setConversionDirection] = useState<
    "timestampToDate" | "dateToTimestamp"
  >("timestampToDate");
  const [formattedResults, setFormattedResults] = useState({
    iso: "",
    rfc2822: "",
    shortDate: "",
    shortTime: "",
    longDate: "",
    longTime: "",
    fullDate: "",
  });

  // Get current timestamp
  const getCurrentTimestamp = useCallback(() => {
    const now = unit === "second" ? Math.floor(Date.now() / 1000) : Date.now();
    setTimestamp(now.toString());
    if (conversionDirection === "timestampToDate") {
      handleTimestampToDate(now.toString());
    }
  }, [unit, conversionDirection]);

  // Convert timestamp to date with proper timezone handling
  const handleTimestampToDate = useCallback(
    (ts: string) => {
      if (!ts.trim()) {
        setDate("");
        setFormattedResults({
          iso: "",
          rfc2822: "",
          shortDate: "",
          shortTime: "",
          longDate: "",
          longTime: "",
          fullDate: "",
        });
        return;
      }

      try {
        const timestampValue =
          unit === "second" ? parseInt(ts) * 1000 : parseInt(ts);
        const dateObj = new Date(timestampValue);

        if (isNaN(dateObj.getTime())) {
          throw new Error("Invalid timestamp");
        }

        // Validate timezone
        let validTimezone = timezone;
        try {
          new Intl.DateTimeFormat("en-US", { timeZone: timezone });
        } catch (error) {
          console.warn(
            `Invalid timezone: ${timezone}, falling back to local timezone`,
          );
          validTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        }

        // Main display date
        const mainFormatter = new Intl.DateTimeFormat("en-US", {
          timeZone: validTimezone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZoneName: "short",
        });

        setDate(mainFormatter.format(dateObj));

        // Generate all formatted results
        setFormattedResults({
          iso: dateObj.toISOString(),
          rfc2822: dateObj.toUTCString(),
          shortDate: new Intl.DateTimeFormat("en-US", {
            timeZone: validTimezone,
            dateStyle: "short",
          }).format(dateObj),
          shortTime: new Intl.DateTimeFormat("en-US", {
            timeZone: validTimezone,
            timeStyle: "short",
          }).format(dateObj),
          longDate: new Intl.DateTimeFormat("en-US", {
            timeZone: validTimezone,
            dateStyle: "long",
          }).format(dateObj),
          longTime: new Intl.DateTimeFormat("en-US", {
            timeZone: validTimezone,
            timeStyle: "long",
          }).format(dateObj),
          fullDate: new Intl.DateTimeFormat("en-US", {
            timeZone: validTimezone,
            dateStyle: "full",
            timeStyle: "long",
          }).format(dateObj),
        });
      } catch (error) {
        console.error("Conversion error:", error);
        const errorMessage = "Invalid timestamp or timezone";
        setDate(errorMessage);
        setFormattedResults({
          iso: errorMessage,
          rfc2822: errorMessage,
          shortDate: errorMessage,
          shortTime: errorMessage,
          longDate: errorMessage,
          longTime: errorMessage,
          fullDate: errorMessage,
        });
      }
    },
    [unit, timezone],
  );

  // Convert date to timestamp with proper timezone handling
  const handleDateToTimestamp = useCallback(
    (dateStr: string) => {
      if (!dateStr.trim()) {
        setTimestamp("");
        return;
      }

      try {
        // Create date object with proper timezone handling
        let dateObj: Date;

        if (dateStr.match(/^\d+$/)) {
          // It's a timestamp
          const timestampValue =
            unit === "second" ? parseInt(dateStr) * 1000 : parseInt(dateStr);
          dateObj = new Date(timestampValue);
        } else {
          // It's a date string - try to parse with timezone
          const dateWithTimezone = `${dateStr} GMT`;
          dateObj = new Date(dateWithTimezone);

          // If that fails, try without timezone
          if (isNaN(dateObj.getTime())) {
            dateObj = new Date(dateStr);
          }
        }

        if (isNaN(dateObj.getTime())) {
          throw new Error("Invalid date format");
        }

        const timestampValue =
          unit === "second"
            ? Math.floor(dateObj.getTime() / 1000)
            : dateObj.getTime();

        setTimestamp(timestampValue.toString());
      } catch (error) {
        setTimestamp("Invalid date format");
      }
    },
    [unit],
  );

  // Handle conversion based on direction
  const handleConversion = useCallback(() => {
    if (conversionDirection === "timestampToDate") {
      handleTimestampToDate(timestamp);
    } else {
      handleDateToTimestamp(date);
    }
  }, [
    conversionDirection,
    timestamp,
    date,
    handleTimestampToDate,
    handleDateToTimestamp,
  ]);

  // Effects for auto-conversion
  useEffect(() => {
    handleConversion();
  }, [handleConversion]);

  useEffect(() => {
    getCurrentTimestamp();
  }, [getCurrentTimestamp]);

  // Reset to current time when timezone changes
  useEffect(() => {
    if (timestamp) {
      handleConversion();
    }
  }, [timezone, handleConversion]);

  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard!");
    });
  };

  // Download results
  const downloadResults = () => {
    const content = `Timestamp Converter Results:
    
Original ${conversionDirection === "timestampToDate" ? "Timestamp" : "Date"}: ${conversionDirection === "timestampToDate" ? timestamp : date}
Converted ${conversionDirection === "timestampToDate" ? "Date" : "Timestamp"}: ${conversionDirection === "timestampToDate" ? date : timestamp}
Timezone: ${timezone}
Unit: ${unit}

Formatted Results:
ISO 8601: ${formattedResults.iso}
RFC 2822: ${formattedResults.rfc2822}
Short Date: ${formattedResults.shortDate}
Short Time: ${formattedResults.shortTime}
Long Date: ${formattedResults.longDate}
Long Time: ${formattedResults.longTime}
Full Date: ${formattedResults.fullDate}`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "timestamp-conversion-results.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="container mx-auto max-w-7xl space-y-4 px-4 py-8">
      <div className="flex flex-col gap-2">
        <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight xl:text-4xl">
          Timestamp Converter
        </h1>
        <p className="text-[1.05rem] text-balance text-muted-foreground sm:text-base">
          Convert UNIX timestamps to and from plain dates
        </p>
      </div>

      <Separator />

      <div className="space-y-2">
        <h2 className="font-heading scroll-m-28 text-xl font-medium tracking-tight">
          Tool Options
        </h2>

        <div className="flex flex-1 flex-row items-center space-x-4">
          <ClockAltIcon className="ml-4" />
          <div className="flex flex-1 flex-col">
            <div className="flex w-fit items-center gap-2 text-sm leading-snug font-medium select-none">
              Timezone
            </div>
            <div className="text-sm leading-normal font-normal text-muted-foreground not-md:hidden last:mt-0 nth-last-2:-mt-1">
              Current: {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </div>
          </div>
          <TimezoneSelect value={timezone} onValueChange={setTimezone} />
        </div>

        <div className="flex flex-1 flex-row items-center space-x-4">
          <HorizonalArrowsIcon className="ml-4" />
          <div className="flex flex-1 flex-col">
            <div className="flex w-fit items-center gap-2 text-sm leading-snug font-medium select-none">
              Conversion Direction
            </div>
            <div className="text-sm leading-normal font-normal text-muted-foreground not-md:hidden last:mt-0 nth-last-2:-mt-1">
              Select the input format and desired output format
            </div>
          </div>
          <Tabs
            value={conversionDirection}
            onValueChange={(value) =>
              setConversionDirection(
                value as "timestampToDate" | "dateToTimestamp",
              )
            }
            className="w-fit"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="timestampToDate">
                Timestamp → Date
              </TabsTrigger>
              <TabsTrigger value="dateToTimestamp">
                Date → Timestamp
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex flex-1 flex-row items-center space-x-4">
          <ClockIcon className="ml-4 h-4 w-4" />
          <div className="flex flex-1 flex-col">
            <div className="flex w-fit items-center gap-2 text-sm leading-snug font-medium select-none">
              Time Unit
            </div>
            <div className="text-sm leading-normal font-normal text-muted-foreground not-md:hidden last:mt-0 nth-last-2:-mt-1">
              Select timestamp unit
            </div>
          </div>
          <Tabs
            value={unit}
            onValueChange={(value) =>
              setUnit(value as "second" | "millisecond")
            }
            className="w-fit"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="second">Seconds</TabsTrigger>
              <TabsTrigger value="millisecond">Milliseconds</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex w-fit items-center gap-2 text-sm leading-snug font-medium select-none">
            {conversionDirection === "timestampToDate" ? "Timestamp" : "Date"}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={getCurrentTimestamp}>
              Now
            </Button>
          </div>
        </div>
        <Input
          value={conversionDirection === "timestampToDate" ? timestamp : date}
          onChange={(e) => {
            if (conversionDirection === "timestampToDate") {
              setTimestamp(e.target.value);
            } else {
              setDate(e.target.value);
            }
          }}
          placeholder={
            conversionDirection === "timestampToDate"
              ? `Enter ${unit} timestamp...`
              : "Enter date (e.g., 2023-12-25 14:30:00)"
          }
        />
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex w-fit items-center gap-2 text-sm leading-snug font-medium select-none">
            {conversionDirection === "timestampToDate" ? "Date" : "Timestamp"}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                copyToClipboard(
                  conversionDirection === "timestampToDate" ? date : timestamp,
                )
              }
            >
              <CopyIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={downloadResults}>
              <DownloadIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Input
          value={conversionDirection === "timestampToDate" ? date : timestamp}
          readOnly
          className="bg-muted/50"
        />
      </div>

      {conversionDirection === "timestampToDate" && (
        <>
          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex w-fit items-center gap-2 text-sm leading-snug font-medium select-none">
                <CalendarIcon className="h-4 w-4" />
                Formatted Results
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">ISO 8601 (UTC)</label>
                <Input
                  value={formattedResults.iso}
                  readOnly
                  className="bg-muted/50 font-mono text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium">RFC 2822 (UTC)</label>
                <Input
                  value={formattedResults.rfc2822}
                  readOnly
                  className="bg-muted/50 font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">
                    Short Date ({timezone})
                  </label>
                  <Input
                    value={formattedResults.shortDate}
                    readOnly
                    className="bg-muted/50 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Short Time ({timezone})
                  </label>
                  <Input
                    value={formattedResults.shortTime}
                    readOnly
                    className="bg-muted/50 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">
                    Long Date ({timezone})
                  </label>
                  <Input
                    value={formattedResults.longDate}
                    readOnly
                    className="bg-muted/50 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Long Time ({timezone})
                  </label>
                  <Input
                    value={formattedResults.longTime}
                    readOnly
                    className="bg-muted/50 font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Full Date ({timezone})
                </label>
                <Input
                  value={formattedResults.fullDate}
                  readOnly
                  className="bg-muted/50 font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
