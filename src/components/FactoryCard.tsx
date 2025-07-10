import React from "react";
import { Box, Text, Badge, Flex } from "@chakra-ui/react";
import type { FactoryFeature, UserLocation } from "../types/factory";
import { HIGH_RISK_FACTORY_TYPES } from "../types/factory";
import { colors } from "../theme";

interface FactoryCardProps {
  factory: FactoryFeature;
  isSelected: boolean;
  onClick: () => void;
  userLocation: UserLocation | null;
}

const FactoryCard: React.FC<FactoryCardProps> = ({
  factory,
  isSelected,
  onClick,
  userLocation,
}) => {
  const props = factory.properties;

  // Check if this factory is high-risk
  const isHighRisk = HIGH_RISK_FACTORY_TYPES.includes(props.ประเภท);

  // Calculate distance if user location is available
  let distance: number | null = null;
  if (userLocation) {
    // Simple distance calculation (Haversine formula approximation)
    const R = 6371; // Earth's radius in kilometers
    const factoryLat = factory.geometry.coordinates[1];
    const factoryLng = factory.geometry.coordinates[0];
    const dLat = ((factoryLat - userLocation.lat) * Math.PI) / 180;
    const dLng = ((factoryLng - userLocation.lng) * Math.PI) / 180;
    const lat1 = (userLocation.lat * Math.PI) / 180;
    const lat2 = (factoryLat * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    distance = R * c;
  }

  return (
    <Box
      p={4}
      borderBottom="1px"
      borderColor={colors.gray}
      cursor="pointer"
      bg={isSelected ? colors.sky : "white"}
      _hover={{
        bg: isSelected ? colors.sky : colors.beige,
      }}
      _active={{
        bg: colors.sky,
        transform: "scale(0.98)",
      }}
      transition="all 0.2s ease"
      onClick={onClick}
      minH="120px" // Ensure minimum touch target height
      borderLeft={isHighRisk ? "4px solid #dc2626" : "4px solid transparent"}
    >
      <Box>
        {/* High-risk indicator and Factory name */}
        <Flex justify="space-between" align="start" mb={3}>
          <Text
            fontWeight="bold"
            color={colors.navy}
            fontSize={{ base: "md", md: "md" }}
            lineHeight="1.3"
            flex="1"
            pr={2}
          >
            {props.ชื่อโรงงาน}
          </Text>
          {isHighRisk && (
            <Badge
              bg="#dc2626"
              color="white"
              size="sm"
              px={2}
              py={1}
              borderRadius="md"
              fontSize="xs"
              flexShrink={0}
            >
              ⚠️ เสี่ยงสูง
            </Badge>
          )}
        </Flex>

        {/* Owner */}
        <Text
          fontSize={{ base: "sm", md: "sm" }}
          color={colors.gray}
          mb={2}
          lineHeight="1.4"
        >
          ผู้ประกอบการ: {props.ผู้ประกอบก}
        </Text>

        {/* Business type */}
        <Text
          fontSize={{ base: "sm", md: "sm" }}
          color={colors.gray}
          mb={3}
          lineHeight="1.4"
        >
          ประกอบกิจการ: {props.ประกอบกิจก}
        </Text>

        {/* Meta info */}
        <Flex justify="space-between" align="center" mb={3}>
          <Badge
            bg={colors.orange}
            color="white"
            size={{ base: "sm", md: "sm" }}
            px={3}
            py={1}
            borderRadius="full"
          >
            {props.ประเภท}
          </Badge>

          {distance && (
            <Text
              fontSize={{ base: "sm", md: "xs" }}
              color={colors.steel}
              fontWeight="medium"
            >
              {distance < 1
                ? `${(distance * 1000).toFixed(0)} ม.`
                : `${distance.toFixed(1)} กม.`}
            </Text>
          )}
        </Flex>

        {/* District */}
        <Text fontSize={{ base: "sm", md: "xs" }} color={colors.steel} mb={1}>
          {props.อำเภอ}
        </Text>

        {/* Phone number if available */}
        {props.โทรศัพท์ && (
          <Text fontSize={{ base: "sm", md: "xs" }} color={colors.steel} mt={1}>
            โทรศัพท์: {props.โทรศัพท์}
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default FactoryCard;
