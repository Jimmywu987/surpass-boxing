import { CoachCard } from "@/features/coaches/components/CoachCard";
import { trpc } from "@/utils/trpc";
import { Skeleton, Stack } from "@chakra-ui/react";

const CoachesPage = () => {
  const { data, isLoading } = trpc.coachInfosRouter.fetchForPublic.useQuery();
  if (!data || isLoading) {
    return (
      <div className="flex justify-center mt-10">
        <Stack className="w-full md:w-[600px]">
          <Skeleton h="400px" />
        </Stack>
      </div>
    );
  }

  return (
    <div className="flex justify-center mt-10 space-y-4">
      {data.map((coachInfo, index) => (
        <CoachCard coachInfo={coachInfo} key={index} />
      ))}
    </div>
  );
};

export default CoachesPage;
