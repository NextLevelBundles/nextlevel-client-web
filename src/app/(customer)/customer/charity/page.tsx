/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/customer/components/ui/card";
import { Button } from "@/customer/components/ui/button";
import { Input } from "@/customer/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/customer/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/customer/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/customer/components/ui/table";
import { motion } from "framer-motion";
import {
  HeartIcon,
  PackageIcon,
  TrophyIcon,
  CalendarIcon,
  ExternalLinkIcon,
  SearchIcon,
  SparklesIcon,
  DownloadIcon,
  ArrowUpDownIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";

// Mock data - replace with API call
const charityStats = {
  totalDonated: 142.5,
  totalBundles: 12,
  mostSupportedCharity: "AbleGamers Foundation",
  mostSupportedAmount: 75.5,
};

const monthlyDonations = [
  { month: "Jan", amount: 15 },
  { month: "Feb", amount: 22.5 },
  { month: "Mar", amount: 105, bundles: 5, charities: 2 },
];

const donationHistory = [
  {
    id: 1,
    bundleName: "Indie Gems Collection",
    date: "2024-03-20",
    charity: "AbleGamers Foundation",
    amount: 5.0,
    bundleId: 1,
  },
  {
    id: 2,
    bundleName: "Strategy Masters Pack",
    date: "2024-03-15",
    charity: "Girls Who Code",
    amount: 2.5,
    bundleId: 2,
  },
  {
    id: 3,
    bundleName: "RPG Essentials Bundle",
    date: "2024-03-10",
    charity: "AbleGamers Foundation",
    amount: 7.5,
    bundleId: 3,
  },
];

export default function CharityPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedYear, setSelectedYear] = React.useState("All Years");
  const [selectedCharity, setSelectedCharity] = React.useState("All Charities");
  const [sortBy, setSortBy] = React.useState("date");
  const [showCharityModal, setShowCharityModal] = React.useState(false);
  const [selectedCharityDetails, setSelectedCharityDetails] =
    useState<any>(null);

  const years = ["All Years", "2024", "2023"];
  const charities = [
    "All Charities",
    "AbleGamers Foundation",
    "Girls Who Code",
  ];
  const sortOptions = [
    { value: "date", label: "Date" },
    { value: "amount", label: "Amount" },
    { value: "charity", label: "Charity Name" },
  ];

  const handleCharityClick = (charity: any) => {
    setSelectedCharityDetails({
      name: charity,
      description:
        "Supporting gamers with disabilities through technology and community.",
      totalSupport: "$250,000+",
      website: "https://ablegamers.org",
    });
    setShowCharityModal(true);
  };

  const handleDownload = (format: string) => {
    toast.success(`Downloading donation history as ${format}...`);
  };

  let filteredDonations = donationHistory.filter((donation) => {
    const matchesSearch = donation.bundleName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesYear =
      selectedYear === "All Years" || donation.date.includes(selectedYear);
    const matchesCharity =
      selectedCharity === "All Charities" ||
      donation.charity === selectedCharity;

    return matchesSearch && matchesYear && matchesCharity;
  });

  // Sort donations based on selected criteria
  filteredDonations = [...filteredDonations].sort((a, b) => {
    switch (sortBy) {
      case "amount":
        return b.amount - a.amount;
      case "charity":
        return a.charity.localeCompare(b.charity);
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  return (
    <>
      <div className="grid gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Your Charitable Impact</h1>
          <p className="text-muted-foreground">
            Track your contributions and see how you&apos;ve helped support
            causes through your purchases.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-1"
          >
            <Card className="bg-linear-to-br from-primary/5 to-primary/10 dark:from-primary/20 dark:to-primary/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Donated
                </CardTitle>
                <div className="relative">
                  <HeartIcon className="h-5 w-5 text-primary animate-pulse" />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -right-1 -top-1"
                  >
                    <SparklesIcon className="h-3 w-3 text-yellow-400" />
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${charityStats.totalDonated.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -4 }}
          >
            <Card className="bg-linear-to-br from-card to-card/95">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Bundles Contributed
                </CardTitle>
                <PackageIcon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {charityStats.totalBundles}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -4 }}
          >
            <Card className="bg-linear-to-br from-card to-card/95">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Most Supported
                </CardTitle>
                <TrophyIcon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div
                  className="text-2xl font-bold truncate"
                  title={charityStats.mostSupportedCharity}
                >
                  {charityStats.mostSupportedCharity}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  ${charityStats.mostSupportedAmount.toFixed(2)} donated
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Monthly Donations</CardTitle>
                <div className="text-sm text-muted-foreground">
                  March: $105 • Peak Month 🚀
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyDonations}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value, name, props) => {
                      const data = monthlyDonations[(props as any).index];

                      return [
                        <div key="tooltip" className="space-y-1">
                          <div className="font-medium">${value}</div>
                          {data?.bundles && data?.charities && (
                            <div className="text-xs text-muted-foreground">
                              {data.bundles} bundles • {data.charities}{" "}
                              charities
                            </div>
                          )}
                        </div>,
                      ];
                    }}
                  />
                  <Bar
                    dataKey="amount"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Donation History</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload("csv")}
                    className="gap-2"
                  >
                    <DownloadIcon className="h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search bundles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[180px] gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedCharity}
                  onValueChange={setSelectedCharity}
                >
                  <SelectTrigger className="w-[180px] gap-2">
                    <HeartIcon className="h-4 w-4" />
                    <SelectValue placeholder="Select Charity" />
                  </SelectTrigger>
                  <SelectContent>
                    {charities.map((charity) => (
                      <SelectItem key={charity} value={charity}>
                        {charity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] gap-2">
                    <ArrowUpDownIcon className="h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bundle Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Charity</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDonations.map((donation, index) => (
                      <motion.tr
                        key={donation.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group"
                      >
                        <TableCell className="font-medium">
                          {donation.bundleName}
                        </TableCell>
                        <TableCell>
                          {new Date(donation.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="link"
                            className="p-0 h-auto"
                            onClick={() => handleCharityClick(donation.charity)}
                          >
                            {donation.charity}
                          </Button>
                        </TableCell>
                        <TableCell>${donation.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() =>
                              (window.location.href = `/my-bundles/${donation.bundleId}`)
                            }
                          >
                            <ExternalLinkIcon className="h-4 w-4 mr-2" />
                            View Bundle
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Card className="bg-linear-to-br from-accent/10 to-accent/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-accent/20 p-3">
                <SparklesIcon className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  3 Month Donation Streak! 🎉
                </h3>
                <p className="text-sm text-muted-foreground">
                  Keep it up to earn the Charity Champion badge
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center text-muted-foreground text-sm"
        >
          Each time you support a bundle, a portion goes to a cause you care
          about. Thank you for being part of the mission. ❤️
        </motion.div>
      </div>

      <Dialog open={showCharityModal} onOpenChange={setShowCharityModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCharityDetails?.name}</DialogTitle>
            <DialogDescription className="pt-4">
              <div className="space-y-4">
                <p>{selectedCharityDetails?.description}</p>
                <div className="rounded-lg bg-muted/20 p-4">
                  <p className="font-medium">Total Platform Support</p>
                  <p className="text-2xl font-bold">
                    {selectedCharityDetails?.totalSupport}
                  </p>
                </div>
                <Button
                  className="w-full"
                  onClick={() => window.open(selectedCharityDetails?.website)}
                >
                  Visit Website
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
