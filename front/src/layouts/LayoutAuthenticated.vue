<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  Bars3Icon,
  UserIcon,
  XMarkIcon,
  ArrowRightStartOnRectangleIcon,
  BellAlertIcon,
  HomeIcon,
  UserGroupIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UsersIcon,
  EnvelopeIcon,
  BookOpenIcon,
  UserPlusIcon,
  CalendarIcon,
} from "@heroicons/vue/24/outline";
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from "@headlessui/vue";

const router = useRouter();

// Récupérer les informations de l'utilisateur depuis le localStorage
const user = ref({
  firstname: "",
  lastname: "",
});

onMounted(() => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    const parsedUser = JSON.parse(storedUser);
    user.value = {
      firstname: parsedUser.firstname || "",
      lastname: parsedUser.lastname || "",
    };
  }
});

const navigation = [
  {
    name: "Accueil",
    href: "/",
    icon: HomeIcon,
    current: router.currentRoute.value.path === "/",
  },
  {
    name: "Planning",
    href: "/planification",
    icon: CalendarIcon,
    current: router.currentRoute.value.path === "/planification",
  },
  {
    name: "Enseignants",
    href: "/enseignants",
    icon: UsersIcon,
    current: router.currentRoute.value.path === "/enseignants",
  },
  {
    name: "Etudiants",
    href: "/etudiants",
    icon: UserGroupIcon,
    current: router.currentRoute.value.path === "/students",
  },
  {
    name: "Messages",
    href: "/messages",
    icon: EnvelopeIcon,
    current: router.currentRoute.value.path === "/messages",
  },
  {
    name: "Alertes",
    href: "/alerte", // Lien pour envoyer une alerte
    icon: BellAlertIcon,
    current: router.currentRoute.value.path === "/alerte",
  },
  {
    name: "Utilisateurs",
    href: "/users",
    icon: UserPlusIcon,
    current: router.currentRoute.value.path === "/users",
  },
  {
    name: "Cours",
    href: "/courses",
    icon: BookOpenIcon,
    current: router.currentRoute.value.path === "/courses",
  },
  {
    name: "Classes",
    href: "/classes",
    icon: BookOpenIcon,
    current: router.currentRoute.value.path === "/classes",
  },
  {
    name: "Indisponibilités",
    href: "/unavailabilities",
    icon: BookOpenIcon,
    current: router.currentRoute.value.path === "/unavailabilities",
  },
];

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

const sidebarOpen = ref(false);
const sidebarLarge = ref(true);

onMounted(() => {
  if (localStorage.getItem("sidebarLarge")) {
    sidebarLarge.value = localStorage.getItem("sidebarLarge") === "true";
  }
});

const toggleLargeSidebar = () => {
  sidebarLarge.value = !sidebarLarge.value;
  localStorage.setItem("sidebarLarge", sidebarLarge.value.toString());
};
</script>

<template>
  <div>
    <!-- Mobile menu, show/hide based on menu open state. -->
    <TransitionRoot as="template" :show="sidebarOpen">
      <Dialog
        as="div"
        class="relative z-50 lg:hidden"
        @close="sidebarOpen = false"
      >
        <TransitionChild
          as="template"
          enter="transition-opacity ease-linear duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-primary/80" />
        </TransitionChild>

        <div class="fixed inset-0 flex">
          <TransitionChild
            as="template"
            enter="transition ease-in-out duration-300 transform"
            enter-from="-translate-x-full"
            enter-to="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leave-from="translate-x-0"
            leave-to="-translate-x-full"
          >
            <DialogPanel class="relative mr-16 flex w-full max-w-xs flex-1">
              <!-- Sidebar content -->
              <div class="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-2 ring-1 ring-white/10 bg-gray-50 relative z-10">
                <XMarkIcon
                  class="h-6 w-6 absolute rigth-5 top-5 cursor-pointer hover:bg-gray-100"
                  @click="sidebarOpen = false"
                  aria-hidden="true"
                />
                <RouterLink to="/" class="flex shrink-0 items-center mt-16">
                  <h1 class="text-2xl font-bold text-green-700">Hackathon</h1>
                </RouterLink>
                <nav class="flex flex-1 flex-col">
                  <ul role="list" class="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" class="-mx-2 space-y-1">
                        <li v-for="item in navigation" :key="item.name">
                          <a
                            :href="item.href"
                            :class="[
                              item.current
                                ? 'text-secondary'
                                : 'hover:bg-secondary/20',
                              'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold',
                            ]"
                          >
                            <component
                              :is="item.icon"
                              class="h-6 w-6 shrink-0"
                              aria-hidden="true"
                            />
                            {{ item.name }}
                          </a>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Static sidebar for desktop -->
    <div
      class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col bg-gray-50/30 lg:border-r lg:border-white/10 lg:shadow-lg lg:top-0 lg:bottom-0 lg:overflow-y-auto lg:transition-all lg:duration-300"
      :class="{ 'lg:w-auto': !sidebarLarge }"
    >
      <div class="flex grow flex-col gap-y-5 overflow-y-auto px-6">
        <div>
          <RouterLink
            to="/"
            class="flex shrink-0 items-center mt-5"
            :class="{ 'h-0': !sidebarLarge, 'h-12': sidebarLarge }"
          >
            <h1
              class="text-2xl font-bold text-secondary"
              :class="{ hidden: !sidebarLarge }"
            >
              Hackathon
            </h1>
          </RouterLink>
          <ChevronLeftIcon
            v-if="sidebarLarge"
            class="h-6 w-6 absolute right-5 top-5 cursor-pointer bg-gray-100 p-1 rounded-md hover:bg-gray-200"
            @click="toggleLargeSidebar()"
            aria-hidden="true"
          />
          <ChevronRightIcon
            v-else
            class="h-7 w-7 cursor-pointer bg-gray-100 p-1 rounded-md hover:bg-gray-200"
            @click="toggleLargeSidebar()"
            aria-hidden="true"
          />
          <hr class="mt-5" />
        </div>
        <nav class="flex flex-1 flex-col">
          <ul role="list" class="flex flex-1 flex-col gap-y-7 text-gray-700">
            <li>
              <ul role="list" class="-mx-2 space-y-1">
                <li v-for="item in navigation" :key="item.name">
                  <a
                    :href="item.href"
                    :class="[
                      item.current
                        ? 'text-secondary font-semibold bg-primary/20'
                        : '',
                      'group flex gap-x-3 rounded-md py-2 px-3 text-sm leading-6 font-medium hover:bg-secondary/20',
                    ]"
                  >
                    <component
                      :is="item.icon"
                      class="h-5 w-5 shrink-0"
                      aria-hidden="true"
                      :class="item.current ? 'text-green-700' : 'text-gray-700'"
                    />
                    {{ !sidebarLarge ? "" : item.name }}
                  </a>
                </li>
              </ul>
            </li>
            <li class="mt-auto -mx-2">
              <hr class="mx-2 mb-3" />
              <a
                href="/profile"
                :class="[
                  router.currentRoute.value.path === '/profile'
                    ? 'text-gray-900 bg-green-50 font-semibold'
                    : 'hover:bg-secondary/20',
                  'group flex gap-x-3 rounded-md py-2 px-3 text-sm leading-6 font-medium hover:bg-secondary/20 text-gray-700',
                ]"
              >
                <UserIcon
                  class="h-5 w-5 shrink-0"
                  aria-hidden="true"
                  :class="
                    router.currentRoute.value.path === '/profile'
                      ? 'text-green-700'
                      : 'text-gray-700'
                  "
                />
                {{ !sidebarLarge ? "" : user.firstname + " " + user.lastname }}
              </a>

              <a
                type="button"
                @click="logout"
                class="mb-5 cursor-pointer hover:bg-secondary/20 group flex gap-x-3 rounded-md py-2 px-3 text-sm leading-6 font-medium text-gray-700"
              >
                <ArrowRightStartOnRectangleIcon
                  class="h-5 w-5 shrink-0"
                  aria-hidden="true"
                />
                {{ !sidebarLarge ? "" : "Déconnexion" }}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <div
      class="sticky top-0 z-40 flex items-center gap-x-6 px-4 py-4 shadow-sm sm:px-6 lg:hidden bg-white"
    >
      <button
        type="button"
        class="-m-2.5 p-2.5 lg:hidden"
        @click="sidebarOpen = true"
      >
        <span class="sr-only">Ouvrir la barre</span>
        <Bars3Icon class="h-6 w-6" aria-hidden="true" />
      </button>
      <a href="/profile">
        <span class="sr-only">Votre profil</span>
        <UserIcon class="h-6 w-6 shrink-0 text-white" aria-hidden="true" />
      </a>
    </div>

    <main :class="{ 'lg:pl-20': !sidebarLarge, 'lg:pl-64': sidebarLarge }">
      <slot />
    </main>
  </div>
</template>
