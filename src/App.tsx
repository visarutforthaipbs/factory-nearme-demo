import React, { useState, useEffect } from "react";
import {
  ChakraProvider,
  Box,
  Flex,
  useBreakpointValue,
  Button,
} from "@chakra-ui/react";
import type {
  FactoryGeoJSON,
  FilterState,
  UserLocation,
  FactoryFeature,
} from "./types/factory";
import Sidebar from "./components/Sidebar";
import MapWrapper from "./components/MapWrapper";
import { colors, theme } from "./theme";

function App() {
  const [factories, setFactories] = useState<FactoryGeoJSON | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [selectedFactory, setSelectedFactory] = useState<FactoryFeature | null>(
    null
  );
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    factoryTypes: [],
    districts: [],
    showOnlyInRadius: false,
    showHighRisk: false,
  });

  // Mobile responsive state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Load factories data
  useEffect(() => {
    fetch("/data/factories.geojson")
      .then((response) => response.json())
      .then((data) => {
        console.log("✅ Loaded", data?.features?.length, "factories");
        setFactories(data);
      })
      .catch((error) => console.error("❌ Error loading factories:", error));
  }, []);

  // Get user location with improved error handling
  useEffect(() => {
    const getLocation = () => {
      if (!navigator.geolocation) {
        console.log("Geolocation not supported, using fallback location");
        setLocationError("เบราว์เซอร์ไม่รองรับการระบุตำแหน่ง");
        setUserLocation({
          lat: 14.0504,
          lng: 101.3678,
        });
        setIsLocationLoading(false);
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds timeout
        maximumAge: 300000, // 5 minutes cache
      };

      console.log("🌍 Requesting user location...");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("✅ Location obtained:", {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });

          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationError(null);
          setIsLocationLoading(false);
        },
        (error) => {
          let errorMessage = "ไม่สามารถระบุตำแหน่งได้";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "การเข้าถึงตำแหน่งถูกปฏิเสธ กรุณาอนุญาตในการตั้งค่าเบราว์เซอร์";
              console.log("📍 Location access denied by user");
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "ไม่สามารถระบุตำแหน่งได้ในขณะนี้";
              console.log(
                "📍 Location unavailable (GPS disabled or no signal)"
              );
              break;
            case error.TIMEOUT:
              errorMessage = "หมดเวลาในการระบุตำแหน่ง";
              console.log("📍 Location request timed out");
              break;
            default:
              errorMessage = "เกิดข้อผิดพลาดในการระบุตำแหน่ง";
              console.warn("📍 Unexpected geolocation error:", error.message);
              break;
          }

          setLocationError(errorMessage);

          // Use fallback location (Prachinburi city center)
          console.log(
            "🏠 Using fallback location (Prachinburi city center: 14.0504, 101.3678)"
          );
          setUserLocation({
            lat: 14.0504,
            lng: 101.3678,
          });
          setIsLocationLoading(false);
        },
        options
      );
    };

    getLocation();
  }, []);

  // Function to manually set location
  const setManualLocation = (lat: number, lng: number) => {
    setUserLocation({ lat, lng });
    setLocationError(null);
    console.log("📍 Manual location set:", { lat, lng });
  };

  return (
    <div style={{ fontFamily: "'Noto Sans Thai', sans-serif" }}>
      <ChakraProvider theme={theme}>
        <AppContent
          factories={factories}
          userLocation={userLocation}
          selectedFactory={selectedFactory}
          setSelectedFactory={setSelectedFactory}
          filters={filters}
          setFilters={setFilters}
          locationError={locationError}
          isLocationLoading={isLocationLoading}
          setManualLocation={setManualLocation}
          isMobileSidebarOpen={isMobileSidebarOpen}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        />
      </ChakraProvider>
    </div>
  );
}

// AppContent component that uses responsive hooks inside ChakraProvider
interface AppContentProps {
  factories: FactoryGeoJSON | null;
  userLocation: UserLocation | null;
  selectedFactory: FactoryFeature | null;
  setSelectedFactory: (factory: FactoryFeature | null) => void;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  locationError: string | null;
  isLocationLoading: boolean;
  setManualLocation: (lat: number, lng: number) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (isOpen: boolean) => void;
}

const AppContent: React.FC<AppContentProps> = ({
  factories,
  userLocation,
  selectedFactory,
  setSelectedFactory,
  filters,
  setFilters,
  locationError,
  isLocationLoading,
  setManualLocation,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
}) => {
  // Responsive hooks inside ChakraProvider
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;
  const isTablet =
    useBreakpointValue({ base: false, md: true, lg: false }) ?? false;

  return (
    <Box h="100vh" overflow="hidden" bg={colors.beige}>
      <Flex h="full" position="relative">
        {/* Mobile Menu Button */}
        {isMobile && (
          <Button
            position="absolute"
            top={4}
            left={4}
            zIndex={1000}
            size="sm"
            bg={colors.navy}
            color="white"
            _hover={{ bg: colors.orange }}
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          >
            {isMobileSidebarOpen ? "✕" : "☰"}
          </Button>
        )}

        {/* Sidebar - responsive layout */}
        <Box
          position={isMobile ? "fixed" : "relative"}
          left={isMobile && !isMobileSidebarOpen ? "-100%" : "0"}
          top={0}
          zIndex={999}
          h="full"
          w={isMobile ? "85vw" : isTablet ? "320px" : "400px"}
          maxW={isMobile ? "350px" : "none"}
          transition="left 0.3s ease-in-out"
          boxShadow={isMobile ? "xl" : "none"}
        >
          <Sidebar
            factories={factories}
            selectedFactory={selectedFactory}
            filters={filters}
            onFiltersChange={setFilters}
            onFactorySelect={(factory) => {
              setSelectedFactory(factory);
              // Close mobile sidebar when factory is selected
              if (isMobile) {
                setIsMobileSidebarOpen(false);
              }
            }}
            userLocation={userLocation}
            locationError={locationError}
            isLocationLoading={isLocationLoading}
            onManualLocationSet={setManualLocation}
            isMobile={isMobile}
            isTablet={isTablet}
            onMobileClose={() => setIsMobileSidebarOpen(false)}
          />
        </Box>

        {/* Mobile Overlay */}
        {isMobile && isMobileSidebarOpen && (
          <Box
            position="fixed"
            top={0}
            left={0}
            w="100vw"
            h="100vh"
            bg="blackAlpha.600"
            zIndex={998}
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Map Area */}
        <Box flex="1" position="relative" w="100%">
          <MapWrapper
            factories={factories}
            userLocation={userLocation}
            selectedFactory={selectedFactory}
            onFactorySelect={setSelectedFactory}
            filters={filters}
            isMobile={isMobile}
            isTablet={isTablet}
          />
        </Box>
      </Flex>
    </Box>
  );
};

export default App;
