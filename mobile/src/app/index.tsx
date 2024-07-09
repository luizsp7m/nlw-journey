import { Input } from "@/components/input";
import { Image, Text, View } from "react-native";
import { MapPin, Calendar as CalendarIcon, Settings2, UserRoundPlus, ArrowRight } from 'lucide-react-native'
import { colors } from "@/styles/colors";
import { Button } from "@/components/button";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center px-5">
      <Image
        source={require('@/assets/logo.png')}
        className="h-8"
        resizeMode="contain"
      />

      <Text className="text-zinc-400 font-regular text-center text-lg mt-3">
        Convide seus amigos e planeje sua {"\n"} próxima viagem
      </Text>

      <View className="w-full bg-zinc-900 p-4 rounded-xl my-8 border border-zinc-800">
        <Input variant="primary">
          <MapPin
            color={colors.zinc[400]}
            size={20}
          />

          <Input.Field placeholder="Para onde?" />
        </Input>

        <Input>
          <CalendarIcon
            color={colors.zinc[400]}
            size={20}
          />

          <Input.Field placeholder="Quando?" />
        </Input>

        <View className="border-b py-3 border-zinc-800">
          <Button variant="secondary">
            <Button.Title>Alterar local/data</Button.Title>

            <Settings2
              color={colors.zinc[200]}
              size={20}
            />
          </Button>
        </View>

        <Input>
          <UserRoundPlus
            color={colors.zinc[400]}
            size={20}
          />

          <Input.Field placeholder="Quem estará na viagem?" />
        </Input>

        <Button>
          <Button.Title>Continuar</Button.Title>

          <ArrowRight
            color={colors.lime[950]}
            size={20}
          />
        </Button>
      </View>

      <Text className="text-zinc-500 text-center font-regular text-base">
        Ao planejar sua viagem pela plann.er você automaticamente concorda com nossos {" "}
        <Text className="text-zinc-300 underline">termos de uso e políticas de privacidade</Text>
      </Text>
    </View>
  );
}