import React, { useMemo, useState } from "react";
import {
  Box,
  Text,
  Input,
  Button,
  Flex,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  Spinner,
  Tooltip,
} from "@chakra-ui/react";
import type {
  FactoryGeoJSON,
  FactoryFeature,
  FilterState,
  UserLocation,
} from "../types/factory";
import { HIGH_RISK_FACTORY_TYPES, HIGH_RISK_CRITERIA } from "../types/factory";
import FactoryCard from "./FactoryCard";
import { colors } from "../theme";

interface SidebarProps {
  factories: FactoryGeoJSON | null;
  selectedFactory: FactoryFeature | null;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onFactorySelect: (factory: FactoryFeature | null) => void;
  userLocation: UserLocation | null;
  locationError: string | null;
  isLocationLoading: boolean;
  onManualLocationSet: (lat: number, lng: number) => void;
  isMobile?: boolean;
  isTablet?: boolean;
  onMobileClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  factories,
  selectedFactory,
  filters,
  onFiltersChange,
  onFactorySelect,
  userLocation,
  locationError,
  isLocationLoading,
  onManualLocationSet,
  isMobile = false,
  isTablet = false,
  onMobileClose,
}) => {
  // Note: District and factory type filtering can be added here in the future
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [manualLat, setManualLat] = useState<string>("14.0504");
  const [manualLng, setManualLng] = useState<string>("101.3678");

  // Filter factories based on current filters
  const filteredFactories = useMemo(() => {
    if (!factories) return [];

    return factories.features.filter((factory) => {
      const props = factory.properties;

      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch =
          props.ชื่อโรงงาน.toLowerCase().includes(searchLower) ||
          props.ผู้ประกอบก.toLowerCase().includes(searchLower) ||
          props.ประกอบกิจก.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Factory type filter
      if (filters.factoryTypes.length > 0) {
        if (!filters.factoryTypes.includes(props.ประเภท)) return false;
      }

      // District filter
      if (filters.districts.length > 0) {
        if (!filters.districts.includes(props.อำเภอ)) return false;
      }

      // High-risk factory filter
      if (filters.showHighRisk) {
        if (!HIGH_RISK_FACTORY_TYPES.includes(props.ประเภท)) return false;
      }

      // Radius filter (10km) - use proper GeoJSON coordinates
      if (filters.showOnlyInRadius && userLocation) {
        const factoryLat = factory.geometry.coordinates[1];
        const factoryLng = factory.geometry.coordinates[0];
        const distance =
          Math.sqrt(
            Math.pow(factoryLat - userLocation.lat, 2) +
              Math.pow(factoryLng - userLocation.lng, 2)
          ) * 111; // Rough conversion to km

        if (distance > 10) return false;
      }

      return true;
    });
  }, [factories, filters, userLocation]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      searchTerm: e.target.value,
    });
  };

  const handleRadiusToggle = () => {
    onFiltersChange({
      ...filters,
      showOnlyInRadius: !filters.showOnlyInRadius,
    });
  };

  const handleHighRiskToggle = () => {
    onFiltersChange({
      ...filters,
      showHighRisk: !filters.showHighRisk,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchTerm: "",
      factoryTypes: [],
      districts: [],
      showOnlyInRadius: false,
      showHighRisk: false,
    });
  };

  const handleManualLocationSubmit = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (!isNaN(lat) && !isNaN(lng)) {
      onManualLocationSet(lat, lng);
      onClose();
    }
  };

  return (
    <Box
      w="full"
      h="full"
      bg={colors.beige}
      borderRight="1px"
      borderColor={colors.gray}
      overflow="hidden"
    >
      <Box h="full" display="flex" flexDirection="column">
        {/* Header */}
        <Box p={4} w="full" bg={colors.navy} color="white">
          <Flex align="center" mb={3} justify="space-between">
            <Box>
              <Text
                fontSize={isMobile ? "lg" : "xl"}
                fontWeight="bold"
                color={colors.beige}
              >
                โรงงานใกล้ฉัน
              </Text>
              <Text fontSize="sm" color={colors.beige} opacity={0.9}>
                จังหวัดปราจีนบุรี
              </Text>
            </Box>

            {/* Mobile close button */}
            {isMobile && onMobileClose && (
              <Button
                size="sm"
                variant="ghost"
                color="white"
                _hover={{ bg: "whiteAlpha.200" }}
                onClick={onMobileClose}
              >
                ✕
              </Button>
            )}
          </Flex>
        </Box>

        {/* Search and Filters */}
        <Box p={4} w="full" borderBottom="1px" borderColor={colors.gray}>
          <Box>
            {/* Search */}
            <Input
              placeholder="ค้นหาชื่อโรงงาน หรือผู้ประกอบการ..."
              value={filters.searchTerm}
              onChange={handleSearchChange}
              bg="white"
              border="1px"
              borderColor={colors.steel}
              mb={3}
              focusBorderColor={colors.orange}
              _placeholder={{ color: colors.gray }}
              size={isMobile ? "md" : isTablet ? "md" : "md"}
            />

            {/* Location Status */}
            <Box
              mb={3}
              p={3}
              bg="white"
              borderRadius="md"
              border="1px"
              borderColor={colors.steel}
            >
              <Flex justify="space-between" align="center" mb={2}>
                <Text fontSize="sm" fontWeight="medium" color={colors.navy}>
                  ตำแหน่งของคุณ
                </Text>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={onOpen}
                  borderColor={colors.orange}
                  color={colors.orange}
                >
                  ตั้งค่า
                </Button>
              </Flex>

              {isLocationLoading ? (
                <Flex align="center" gap={2}>
                  <Spinner size="sm" color={colors.orange} />
                  <Text fontSize="xs" color={colors.gray}>
                    กำลังระบุตำแหน่ง...
                  </Text>
                </Flex>
              ) : locationError ? (
                <Alert status="warning" size="sm" borderRadius="md">
                  <AlertIcon />
                  <Text fontSize="xs">{locationError}</Text>
                </Alert>
              ) : userLocation ? (
                <Text fontSize="xs" color={colors.steel}>
                  📍 {userLocation.lat.toFixed(4)},{" "}
                  {userLocation.lng.toFixed(4)}
                </Text>
              ) : (
                <Text fontSize="xs" color={colors.gray}>
                  ไม่พบตำแหน่ง
                </Text>
              )}
            </Box>

            {/* High-risk factory filter */}
            <Box mb={3}>
              <Flex align="center" mb={2}>
                <Button
                  size="sm"
                  variant={filters.showHighRisk ? "solid" : "outline"}
                  onClick={handleHighRiskToggle}
                  bg={filters.showHighRisk ? "#dc2626" : "transparent"}
                  color={filters.showHighRisk ? "white" : "#dc2626"}
                  borderColor="#dc2626"
                  _hover={{ bg: "#dc2626", color: "white" }}
                  w="full"
                  mr={2}
                >
                  ⚠️ โรงงานความเสี่ยงสูง
                </Button>
                <Tooltip
                  label={HIGH_RISK_CRITERIA}
                  fontSize="sm"
                  maxW="300px"
                  bg={colors.navy}
                  color="white"
                  borderRadius="md"
                  p={3}
                  hasArrow
                >
                  <Box
                    cursor="help"
                    color={colors.steel}
                    fontSize="sm"
                    fontWeight="bold"
                    _hover={{ color: colors.navy }}
                  >
                    ℹ️
                  </Box>
                </Tooltip>
              </Flex>
            </Box>

            {/* Radius filter */}
            {userLocation && (
              <Box mb={3}>
                <Button
                  size="sm"
                  variant={filters.showOnlyInRadius ? "solid" : "outline"}
                  onClick={handleRadiusToggle}
                  bg={filters.showOnlyInRadius ? colors.orange : "transparent"}
                  color={filters.showOnlyInRadius ? "white" : colors.orange}
                  borderColor={colors.orange}
                  _hover={{ bg: colors.orange, color: "white" }}
                  w="full"
                >
                  📍 แสดงเฉพาะโรงงานในรัศมี 10 กม.
                </Button>
              </Box>
            )}

            {/* Clear filters */}
            {(filters.searchTerm ||
              filters.factoryTypes.length > 0 ||
              filters.districts.length > 0 ||
              filters.showOnlyInRadius ||
              filters.showHighRisk) && (
              <Button
                size="sm"
                variant="outline"
                onClick={clearFilters}
                borderColor={colors.steel}
                color={colors.steel}
                _hover={{ bg: colors.steel, color: "white" }}
              >
                ล้างตัวกรอง
              </Button>
            )}
          </Box>
        </Box>

        {/* Results count */}
        <Box p={3} w="full" bg={`${colors.sky}1A`}>
          <Text
            fontSize="sm"
            color={colors.navy}
            textAlign="center"
            fontWeight="medium"
          >
            พบโรงงาน {filteredFactories.length} แห่ง
            {factories && ` จากทั้งหมด ${factories.features.length} แห่ง`}
          </Text>
        </Box>

        {/* Factory list */}
        <Box flex="1" w="full" overflow="auto">
          {filteredFactories.length > 0 ? (
            <Box>
              {filteredFactories.slice(0, 20).map((factory, index) => (
                <FactoryCard
                  key={`${factory.properties.เลขทะเบียน}-${index}`}
                  factory={factory}
                  isSelected={
                    selectedFactory?.properties.เลขทะเบียน ===
                    factory.properties.เลขทะเบียน
                  }
                  onClick={() => onFactorySelect(factory)}
                  userLocation={userLocation}
                />
              ))}
              {filteredFactories.length > 20 && (
                <Box p={4} textAlign="center">
                  <Text fontSize="sm" color={colors.gray}>
                    แสดงเพียง 20 รายการแรก จาก {filteredFactories.length} รายการ
                  </Text>
                </Box>
              )}
            </Box>
          ) : (
            <Flex h="200px" align="center" justify="center" p={4}>
              <Text color={colors.gray} textAlign="center">
                ไม่พบโรงงานที่ตรงกับเงื่อนไขการค้นหา
              </Text>
            </Flex>
          )}
        </Box>
      </Box>

      {/* Manual Location Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={colors.navy}>ตั้งค่าตำแหน่งแมนนวล</ModalHeader>
          <ModalBody>
            <Text fontSize="sm" color={colors.gray} mb={4}>
              กรอกพิกัดละติจูดและลองติจูดของตำแหน่งที่คุณต้องการ
            </Text>

            <FormControl mb={4}>
              <FormLabel color={colors.navy}>ละติจูด (Latitude)</FormLabel>
              <NumberInput
                value={manualLat}
                onChange={setManualLat}
                focusBorderColor={colors.orange}
              >
                <NumberInputField
                  placeholder="14.0504"
                  borderColor={colors.steel}
                />
              </NumberInput>
            </FormControl>

            <FormControl mb={4}>
              <FormLabel color={colors.navy}>ลองติจูด (Longitude)</FormLabel>
              <NumberInput
                value={manualLng}
                onChange={setManualLng}
                focusBorderColor={colors.orange}
              >
                <NumberInputField
                  placeholder="101.3678"
                  borderColor={colors.steel}
                />
              </NumberInput>
            </FormControl>

            <Box bg={`${colors.sky}1A`} p={3} borderRadius="md" mt={4}>
              <Text
                fontSize="xs"
                color={colors.navy}
                mb={2}
                fontWeight="medium"
              >
                💡 เคล็ดลับการใช้งาน:
              </Text>
              <Text fontSize="xs" color={colors.gray} mb={1}>
                • คลิกขวาบนแผนที่ Google เพื่อดูพิกัด
              </Text>
              <Text fontSize="xs" color={colors.gray} mb={1}>
                • หากเบราว์เซอร์ขอสิทธิ์เข้าถึงตำแหน่ง ให้เลือก "อนุญาต"
              </Text>
              <Text fontSize="xs" color={colors.gray}>
                •
                สามารถตั้งค่าตำแหน่งบ้านหรือที่ทำงานเพื่อค้นหาโรงงานใกล้เคียงได้
              </Text>
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="outline"
              mr={3}
              onClick={onClose}
              borderColor={colors.steel}
              color={colors.steel}
            >
              ยกเลิก
            </Button>
            <Button
              bg={colors.orange}
              color="white"
              onClick={handleManualLocationSubmit}
              _hover={{ bg: colors.steel }}
            >
              บันทึก
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Sidebar;
